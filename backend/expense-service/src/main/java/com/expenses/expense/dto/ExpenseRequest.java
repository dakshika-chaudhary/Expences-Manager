package com.expenses.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull Long userId,
        @NotBlank String category,
        @Positive BigDecimal amount,
        String description,
        LocalDate expenseDate
) {
}
