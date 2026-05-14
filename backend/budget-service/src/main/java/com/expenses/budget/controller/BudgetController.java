package com.expenses.budget.controller;

import com.expenses.budget.dto.BudgetAllocationRequest;
import com.expenses.budget.dto.SalaryPlanRequest;
import com.expenses.budget.entity.BudgetAllocation;
import com.expenses.budget.entity.SalaryPlan;
import com.expenses.budget.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/budgets")
public class BudgetController {
    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping("/salary")
    public SalaryPlan saveSalary(@Valid @RequestBody SalaryPlanRequest request) {
        return budgetService.saveSalary(request);
    }

    @GetMapping("/salary")
    public SalaryPlan getSalary(@RequestParam Long userId, @RequestParam String month) {
        return budgetService.getSalary(userId, YearMonth.parse(month));
    }

    @PostMapping("/allocations")
    public BudgetAllocation saveAllocation(@Valid @RequestBody BudgetAllocationRequest request) {
        return budgetService.saveAllocation(request);
    }

    @GetMapping("/allocations")
    public List<BudgetAllocation> getAllocations(@RequestParam Long userId, @RequestParam String month) {
        return budgetService.getAllocations(userId, YearMonth.parse(month));
    }
}
