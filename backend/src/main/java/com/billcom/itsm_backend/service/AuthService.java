package com.billcom.itsm_backend.service;

import com.billcom.itsm_backend.dto.LoginRequest;
import com.billcom.itsm_backend.dto.LoginResponse;
import com.billcom.itsm_backend.dto.UserDto;
import com.billcom.itsm_backend.entity.User;
import com.billcom.itsm_backend.repository.UserRepository;
import com.billcom.itsm_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email().trim().toLowerCase())
                .filter(u -> encoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect"));
        return new LoginResponse(jwtService.generate(user), UserDto.from(user));
    }
}
