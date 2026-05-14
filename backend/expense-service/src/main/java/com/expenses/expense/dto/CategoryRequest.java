package com.expenses.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CategoryRequest(
        @NotNull Long userId,
        @NotBlank String name,
        @PositiveOrZero BigDecimal monthlyLimit
) {
}
