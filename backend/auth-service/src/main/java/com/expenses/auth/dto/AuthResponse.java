package com.expenses.auth.dto;

public record AuthResponse(
        Long userId,
        String email,
        String accessToken,
        String refreshToken,
        long expiresInMinutes
) {
}
