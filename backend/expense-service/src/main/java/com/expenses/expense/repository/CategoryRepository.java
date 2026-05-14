package com.expenses.expense.repository;

import com.expenses.expense.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrPredefinedTrue(Long userId);

    Optional<Category> findByUserIdAndNameIgnoreCase(Long userId, String name);
}
