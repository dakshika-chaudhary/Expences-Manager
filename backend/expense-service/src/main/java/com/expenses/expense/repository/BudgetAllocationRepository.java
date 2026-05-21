package com.expenses.expense.repository;

import com.expenses.expense.entity.BudgetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetAllocationRepository extends JpaRepository<BudgetAllocation, Long> {
    Optional<BudgetAllocation> findByUserIdAndMonthAndCategoryIgnoreCase(Long userId, String month, String category);
}
