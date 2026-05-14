package com.expenses.expense.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        Long userId,
        String category,
        BigDecimal amount,
        String description,
        LocalDate expenseDate,
        BigDecimal categoryMonthTotal,
        BigDecimal categoryLimit,
        boolean limitExceeded,
        String alertMessage
) {
}
