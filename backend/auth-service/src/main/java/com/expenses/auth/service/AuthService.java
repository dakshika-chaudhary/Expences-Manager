package com.expenses.auth.service;

import com.expenses.auth.dto.AuthResponse;
import com.expenses.auth.entity.AppUser;
import com.expenses.auth.entity.RefreshToken;
import com.expenses.auth.repository.AppUserRepository;
import com.expenses.auth.repository.RefreshTokenRepository;
import com.expenses.auth.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {
    private final AppUserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final OtpEmailService otpEmailService;
    private final StringRedisTemplate redisTemplate;
    private final SecureRandom random = new SecureRandom();
    private final long accessTokenMinutes;
    private final Duration otpTtl;

    public AuthService(
            AppUserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtService jwtService,
            OtpEmailService otpEmailService,
            StringRedisTemplate redisTemplate,
            @Value("${app.jwt.access-token-minutes:30}") long accessTokenMinutes,
            @Value("${app.otp.ttl-minutes:5}") long otpTtlMinutes
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.otpEmailService = otpEmailService;
        this.redisTemplate = redisTemplate;
        this.accessTokenMinutes = accessTokenMinutes;
        this.otpTtl = Duration.ofMinutes(otpTtlMinutes);
    }

    public void sendOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        String otp = String.format("%06d", random.nextInt(1_000_000));

        redisTemplate.opsForValue().set(otpKey(normalizedEmail), otp, otpTtl);

        otpEmailService.sendOtp(normalizedEmail, otp);
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim().toLowerCase();
        String key = otpKey(normalizedEmail);
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new IllegalArgumentException("OTP expired or not requested");
        }
        if (!storedOtp.equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        redisTemplate.delete(key);

        AppUser user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            AppUser created = new AppUser();
            created.setEmail(normalizedEmail);
            return userRepository.save(created);
        });

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            throw new IllegalArgumentException("Refresh token expired");
        }
        AppUser user = userRepository.findByEmail(refreshToken.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return issueTokens(user);
    }

    private AuthResponse issueTokens(AppUser user) {
        String accessToken = jwtService.generateToken(user.getEmail());
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(user.getId());
        refreshToken.setEmail(user.getEmail());
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(user.getId(), user.getEmail(), accessToken, refreshToken.getToken(), accessTokenMinutes);
    }

    private String otpKey(String normalizedEmail) {
        return "expenses-manager:otp:" + normalizedEmail;
    }
}
