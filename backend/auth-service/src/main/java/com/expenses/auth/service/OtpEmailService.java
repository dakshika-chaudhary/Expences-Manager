package com.expenses.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpEmailService {
    private static final Logger log = LoggerFactory.getLogger(OtpEmailService.class);
    private final JavaMailSender mailSender;
    private final boolean emailEnabled;
    private final String fromAddress;

    public OtpEmailService(
            JavaMailSender mailSender,
            @Value("${app.email.enabled:false}") boolean emailEnabled,
            @Value("${spring.mail.username:}") String fromAddress
    ) {
        this.mailSender = mailSender;
        this.emailEnabled = emailEnabled;
        this.fromAddress = fromAddress;
    }

    public void sendOtp(String email, String otp) {
        if (!emailEnabled) {
            log.info("OTP for {} is {}. Email is disabled; set APP_EMAIL_ENABLED=true and SMTP credentials to send mail.", email, otp);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("Your ExpensesManager OTP");
        message.setText("Your OTP is " + otp + ". It expires in 10 minutes.");
        mailSender.send(message);
    }
}
