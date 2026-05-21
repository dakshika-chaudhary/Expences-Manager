package com.expenses.expense.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class NotificationClient {
    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);
    private final RestClient restClient;
    private final String notificationServiceUrl;

    public NotificationClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.notification-service.url:http://localhost:8084}") String notificationServiceUrl
    ) {
        this.restClient = restClientBuilder.build();
        this.notificationServiceUrl = notificationServiceUrl;
    }

    public void sendEmailAlert(String email, String subject, String message) {
        try {
            restClient.post()
                    .uri(notificationServiceUrl + "/notifications/email-alert")
                    .body(new EmailAlertRequest(email, subject, message))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Could not send budget alert email to {}", email, ex);
        }
    }

    private record EmailAlertRequest(String email, String subject, String message) {
    }
}
