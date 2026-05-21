package com.expenses.expense.repository;

import com.expenses.expense.entity.SalaryPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryPlanRepository extends JpaRepository<SalaryPlan, Long> {
    Optional<SalaryPlan> findByUserIdAndMonth(Long userId, String month);
}
