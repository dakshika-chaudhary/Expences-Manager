package com.expenses.budget.repository;

import com.expenses.budget.entity.BudgetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetAllocationRepository extends JpaRepository<BudgetAllocation, Long> {
    List<BudgetAllocation> findByUserIdAndMonth(Long userId, String month);

    Optional<BudgetAllocation> findByUserIdAndMonthAndCategoryIgnoreCase(Long userId, String month, String category);
}
