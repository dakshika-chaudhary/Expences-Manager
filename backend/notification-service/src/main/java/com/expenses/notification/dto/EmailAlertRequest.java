package com.expenses.notification.dto;

public record EmailAlertRequest(String email, String subject, String message) {
}
