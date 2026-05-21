package com.expenses.expense.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "salary_plans")
public class SalaryPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String month;
    private BigDecimal salary;
    private BigDecimal savingsTarget;

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public BigDecimal getSavingsTarget() {
        return savingsTarget;
    }
}
