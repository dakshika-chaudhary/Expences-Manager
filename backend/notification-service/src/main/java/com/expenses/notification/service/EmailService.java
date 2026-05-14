
package com.expenses.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void sendAlert(String email) {
        sendAlert(email, "Budget alert", "A category budget has been exceeded.");
    }

    public void sendAlert(String email, String subject, String message) {
        log.info("Email alert to {} | {} | {}", email, subject, message);
    }
}
