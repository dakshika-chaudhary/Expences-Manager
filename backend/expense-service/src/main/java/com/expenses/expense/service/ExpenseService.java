package com.expenses.expense.service;

import com.expenses.expense.dto.ExpenseRequest;
import com.expenses.expense.dto.ExpenseResponse;
import com.expenses.expense.entity.Category;
import com.expenses.expense.entity.Expense;
import com.expenses.expense.repository.CategoryRepository;
import com.expenses.expense.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;

    public ExpenseService(ExpenseRepository expenseRepository, CategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
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
        BigDecimal monthTotal = expenseRepository.sumForCategoryBetween(
                saved.getUserId(),
                saved.getCategory(),
                month.atDay(1),
                month.atEndOfMonth()
        );

        BigDecimal limit = categoryRepository.findByUserIdAndNameIgnoreCase(saved.getUserId(), saved.getCategory())
                .map(Category::getMonthlyLimit)
                .orElseGet(() -> categoryRepository.findByUserIdOrPredefinedTrue(saved.getUserId()).stream()
                        .filter(category -> category.getName().equalsIgnoreCase(saved.getCategory()))
                        .findFirst()
                        .map(Category::getMonthlyLimit)
                        .orElse(BigDecimal.ZERO));
        boolean exceeded = limit.compareTo(BigDecimal.ZERO) > 0 && monthTotal.compareTo(limit) > 0;
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
}
