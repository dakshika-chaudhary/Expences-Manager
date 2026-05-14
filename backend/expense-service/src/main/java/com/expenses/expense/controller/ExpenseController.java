
package com.expenses.expense.controller;

import com.expenses.expense.dto.CategoryRequest;
import com.expenses.expense.dto.ExpenseRequest;
import com.expenses.expense.dto.ExpenseResponse;
import com.expenses.expense.entity.Category;
import com.expenses.expense.entity.Expense;
import com.expenses.expense.service.CategoryService;
import com.expenses.expense.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class ExpenseController {

    private final ExpenseService expenseService;
    private final CategoryService categoryService;

    public ExpenseController(ExpenseService expenseService, CategoryService categoryService) {
        this.expenseService = expenseService;
        this.categoryService = categoryService;
    }

    @GetMapping("/expenses")
    public List<Expense> getExpenses(@RequestParam Long userId) {
        return expenseService.list(userId);
    }

    @PostMapping("/expenses")
    public ExpenseResponse addExpense(@Valid @RequestBody ExpenseRequest request) {
        return expenseService.create(request);
    }

    @GetMapping("/categories")
    public List<Category> getCategories(@RequestParam Long userId) {
        return categoryService.list(userId);
    }

    @PostMapping("/categories")
    public Category addCategory(@Valid @RequestBody CategoryRequest request) {
        return categoryService.create(request);
    }
}
