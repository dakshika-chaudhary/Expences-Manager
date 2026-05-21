package com.expenses.expense.service;

import com.expenses.expense.dto.ExpenseRequest;
import com.expenses.expense.dto.ExpenseResponse;
import com.expenses.expense.entity.AppUser;
import com.expenses.expense.entity.BudgetAllocation;
import com.expenses.expense.entity.Category;
import com.expenses.expense.entity.Expense;
import com.expenses.expense.entity.SalaryPlan;
import com.expenses.expense.repository.AppUserRepository;
import com.expenses.expense.repository.BudgetAllocationRepository;
import com.expenses.expense.repository.CategoryRepository;
import com.expenses.expense.repository.ExpenseRepository;
import com.expenses.expense.repository.SalaryPlanRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetAllocationRepository budgetAllocationRepository;
    private final SalaryPlanRepository salaryPlanRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationClient notificationClient;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            CategoryRepository categoryRepository,
            BudgetAllocationRepository budgetAllocationRepository,
            SalaryPlanRepository salaryPlanRepository,
            AppUserRepository appUserRepository,
            NotificationClient notificationClient
    ) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.budgetAllocationRepository = budgetAllocationRepository;
        this.salaryPlanRepository = salaryPlanRepository;
        this.appUserRepository = appUserRepository;
        this.notificationClient = notificationClient;
    }

    public List<Expense> list(Long userId) {
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(userId);
    }

    public ExpenseResponse create(ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setUserId(request.userId());
        expense.setCategory(request.category().trim());
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setExpenseDate(request.expenseDate() == null ? LocalDate.now() : request.expenseDate());
        Expense saved = expenseRepository.save(expense);

        YearMonth month = YearMonth.from(saved.getExpenseDate());
        LocalDate monthStart = month.atDay(1);
        LocalDate monthEnd = month.atEndOfMonth();
        BigDecimal monthTotal = expenseRepository.sumForCategoryBetween(
                saved.getUserId(),
                saved.getCategory(),
                monthStart,
                monthEnd
        );
        BigDecimal totalMonthlyExpenses = expenseRepository.sumForUserBetween(saved.getUserId(), monthStart, monthEnd);

        BigDecimal limit = categoryRepository.findByUserIdAndNameIgnoreCase(saved.getUserId(), saved.getCategory())
                .map(Category::getMonthlyLimit)
                .orElseGet(() -> categoryRepository.findByUserIdOrPredefinedTrue(saved.getUserId()).stream()
                        .filter(category -> category.getName().equalsIgnoreCase(saved.getCategory()))
                        .findFirst()
                        .map(Category::getMonthlyLimit)
                        .orElse(BigDecimal.ZERO));
        boolean exceeded = limit.compareTo(BigDecimal.ZERO) > 0 && monthTotal.compareTo(limit) > 0;
        sendLimitAlertsIfNeeded(saved, month, monthTotal, totalMonthlyExpenses, limit);
        String alert = exceeded
                ? "Alert: " + saved.getCategory() + " spending exceeded the monthly limit."
                : "Expense saved and budget is within limit.";

        return new ExpenseResponse(
                saved.getId(),
                saved.getUserId(),
                saved.getCategory(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getExpenseDate(),
                monthTotal,
                limit,
                exceeded,
                alert
        );
    }

    private void sendLimitAlertsIfNeeded(
            Expense saved,
            YearMonth month,
            BigDecimal categoryMonthTotal,
            BigDecimal totalMonthlyExpenses,
            BigDecimal categoryLimit
    ) {
        String email = appUserRepository.findById(saved.getUserId())
                .map(AppUser::getEmail)
                .orElse(null);
        if (email == null || email.isBlank()) {
            return;
        }

        BigDecimal previousCategoryTotal = categoryMonthTotal.subtract(saved.getAmount());
        BigDecimal previousMonthlyTotal = totalMonthlyExpenses.subtract(saved.getAmount());
        List<String> alerts = new ArrayList<>();

        if (crossedLimit(previousCategoryTotal, categoryMonthTotal, categoryLimit)) {
            alerts.add("Category limit exceeded for " + saved.getCategory()
                    + ". Limit: " + categoryLimit
                    + ", current spending: " + categoryMonthTotal + ".");
        }

        budgetAllocationRepository
                .findByUserIdAndMonthAndCategoryIgnoreCase(saved.getUserId(), month.toString(), saved.getCategory())
                .map(BudgetAllocation::getLimitAmount)
                .filter(limit -> crossedLimit(previousCategoryTotal, categoryMonthTotal, limit))
                .ifPresent(limit -> alerts.add("Budget allocation exceeded for " + saved.getCategory()
                        + " in " + month
                        + ". Allocation: " + limit
                        + ", current spending: " + categoryMonthTotal + "."));

        salaryPlanRepository.findByUserIdAndMonth(saved.getUserId(), month.toString())
                .map(this::expenseLimit)
                .filter(limit -> crossedLimit(previousMonthlyTotal, totalMonthlyExpenses, limit))
                .ifPresent(limit -> alerts.add("Monthly expense limit exceeded for " + month
                        + ". Limit after savings target: " + limit
                        + ", current spending: " + totalMonthlyExpenses + "."));

        if (alerts.isEmpty()) {
            return;
        }

        String message = "Hello,\n\n"
                + "Your new expense of " + saved.getAmount() + " for " + saved.getCategory()
                + " on " + saved.getExpenseDate() + " crossed the following limit(s):\n\n"
                + String.join("\n", alerts)
                + "\n\nPlease review your ExpensesManager budget.";

        notificationClient.sendEmailAlert(email, "ExpensesManager budget alert", message);
    }

    private boolean crossedLimit(BigDecimal previousTotal, BigDecimal currentTotal, BigDecimal limit) {
        return limit != null
                && limit.compareTo(BigDecimal.ZERO) > 0
                && previousTotal.compareTo(limit) <= 0
                && currentTotal.compareTo(limit) > 0;
    }

    private BigDecimal expenseLimit(SalaryPlan salaryPlan) {
        BigDecimal salary = salaryPlan.getSalary() == null ? BigDecimal.ZERO : salaryPlan.getSalary();
        BigDecimal savingsTarget = salaryPlan.getSavingsTarget() == null ? BigDecimal.ZERO : salaryPlan.getSavingsTarget();
        return salary.subtract(savingsTarget);
    }
}
