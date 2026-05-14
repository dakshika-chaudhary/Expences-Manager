
package com.expenses.auth.controller;

import com.expenses.auth.dto.AuthResponse;
import com.expenses.auth.dto.RefreshTokenRequest;
import com.expenses.auth.dto.SendOtpRequest;
import com.expenses.auth.dto.VerifyOtpRequest;
import com.expenses.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/send-otp")
    public String sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request.email());
        return "OTP sent successfully";
    }

    @PostMapping("/verify")
    public AuthResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request.email(), request.otp());
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.refreshToken());
    }
}
