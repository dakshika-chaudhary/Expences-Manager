
package com.expenses.budget.service;

import com.expenses.budget.dto.BudgetAllocationRequest;
import com.expenses.budget.dto.SalaryPlanRequest;
import com.expenses.budget.entity.BudgetAllocation;
import com.expenses.budget.entity.SalaryPlan;
import com.expenses.budget.repository.BudgetAllocationRepository;
import com.expenses.budget.repository.SalaryPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;

@Service
public class BudgetService {

    private final SalaryPlanRepository salaryPlanRepository;
    private final BudgetAllocationRepository budgetAllocationRepository;

    public BudgetService(SalaryPlanRepository salaryPlanRepository, BudgetAllocationRepository budgetAllocationRepository) {
        this.salaryPlanRepository = salaryPlanRepository;
        this.budgetAllocationRepository = budgetAllocationRepository;
    }

    @Transactional
    public SalaryPlan saveSalary(SalaryPlanRequest request) {
        String month = YearMonth.parse(request.month()).toString();
        SalaryPlan plan = salaryPlanRepository.findByUserIdAndMonth(request.userId(), month).orElseGet(SalaryPlan::new);
        plan.setUserId(request.userId());
        plan.setMonth(month);
        plan.setSalary(request.salary());
        plan.setSavingsTarget(request.savingsTarget());
        return salaryPlanRepository.save(plan);
    }

    public SalaryPlan getSalary(Long userId, YearMonth month) {
        return salaryPlanRepository.findByUserIdAndMonth(userId, month.toString())
                .orElseThrow(() -> new IllegalArgumentException("Salary plan not found"));
    }

    @Transactional
    public BudgetAllocation saveAllocation(BudgetAllocationRequest request) {
        String month = YearMonth.parse(request.month()).toString();
        BudgetAllocation allocation = budgetAllocationRepository
                .findByUserIdAndMonthAndCategoryIgnoreCase(request.userId(), month, request.category())
                .orElseGet(BudgetAllocation::new);
        allocation.setUserId(request.userId());
        allocation.setMonth(month);
        allocation.setCategory(request.category().trim());
        allocation.setLimitAmount(request.limitAmount());
        return budgetAllocationRepository.save(allocation);
    }

    public List<BudgetAllocation> getAllocations(Long userId, YearMonth month) {
        return budgetAllocationRepository.findByUserIdAndMonth(userId, month.toString());
    }

    public boolean isLimitExceeded(double budget, double expense) {
        return expense > budget;
    }
}
