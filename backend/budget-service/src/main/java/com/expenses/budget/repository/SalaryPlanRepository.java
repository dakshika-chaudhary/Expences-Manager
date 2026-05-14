package com.expenses.budget.repository;

import com.expenses.budget.entity.SalaryPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryPlanRepository extends JpaRepository<SalaryPlan, Long> {
    Optional<SalaryPlan> findByUserIdAndMonth(Long userId, String month);
}
