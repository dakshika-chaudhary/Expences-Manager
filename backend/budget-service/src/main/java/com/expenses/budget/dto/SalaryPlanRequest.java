package com.expenses.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record SalaryPlanRequest(
        @NotNull Long userId,
        @NotBlank String month,
        @PositiveOrZero BigDecimal salary,
        @PositiveOrZero BigDecimal savingsTarget
) {
}
