package com.expenses.auth.repository;

import com.expenses.auth.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByEmailAndOtpAndUsedFalseOrderByIdDesc(String email, String otp);
}
