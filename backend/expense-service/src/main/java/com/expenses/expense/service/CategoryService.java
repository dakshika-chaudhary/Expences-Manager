package com.expenses.expense.service;

import com.expenses.expense.dto.CategoryRequest;
import com.expenses.expense.entity.Category;
import com.expenses.expense.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> list(Long userId) {
        ensureDefaults();
        return categoryRepository.findByUserIdOrPredefinedTrue(userId);
    }

    public Category create(CategoryRequest request) {
        Category category = new Category();
        category.setUserId(request.userId());
        category.setName(request.name().trim());
        category.setMonthlyLimit(request.monthlyLimit());
        category.setPredefined(false);
        return categoryRepository.save(category);
    }

    private void ensureDefaults() {
        if (categoryRepository.count() > 0) {
            return;
        }
        saveDefault("Food", "12000");
        saveDefault("Rent", "25000");
        saveDefault("Transport", "5000");
        saveDefault("Utilities", "6000");
        saveDefault("Health", "4000");
        saveDefault("Education", "5000");
        saveDefault("Entertainment", "3000");
        saveDefault("Savings", "10000");
    }

    private void saveDefault(String name, String limit) {
        Category category = new Category();
        category.setName(name);
        category.setPredefined(true);
        category.setMonthlyLimit(new BigDecimal(limit));
        categoryRepository.save(category);
    }
}
