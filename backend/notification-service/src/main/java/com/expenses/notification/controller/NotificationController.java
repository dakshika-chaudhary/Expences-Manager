package com.expenses.notification.controller;

import com.expenses.notification.dto.EmailAlertRequest;
import com.expenses.notification.service.EmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final EmailService emailService;

    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/email-alert")
    public String sendAlert(@RequestBody EmailAlertRequest request) {
        emailService.sendAlert(request.email(), request.subject(), request.message());
        return "Notification queued";
    }
}
