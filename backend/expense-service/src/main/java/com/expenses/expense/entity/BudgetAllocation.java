package com.expenses.expense.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "budget_allocations")
public class BudgetAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String month;
    private String category;
    private BigDecimal limitAmount;

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getMonth() {
        return month;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getLimitAmount() {
        return limitAmount;
    }
}
