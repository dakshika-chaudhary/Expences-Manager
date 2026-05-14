package com.expenses.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerifyOtpRequest(@Email @NotBlank String email, @NotBlank String otp) {
}
