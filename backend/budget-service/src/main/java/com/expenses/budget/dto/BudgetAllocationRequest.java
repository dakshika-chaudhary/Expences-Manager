package com.expenses.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record BudgetAllocationRequest(
        @NotNull Long userId,
        @NotBlank String month,
        @NotBlank String category,
        @PositiveOrZero BigDecimal limitAmount
) {
}
