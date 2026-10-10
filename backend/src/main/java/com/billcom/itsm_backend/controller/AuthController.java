package com.billcom.itsm_backend.controller;

import com.billcom.itsm_backend.dto.LoginRequest;
import com.billcom.itsm_backend.dto.LoginResponse;
import com.billcom.itsm_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
