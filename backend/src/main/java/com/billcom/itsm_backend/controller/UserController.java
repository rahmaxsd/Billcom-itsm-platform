package com.billcom.itsm_backend.controller;

import com.billcom.itsm_backend.dto.UserDto;
import com.billcom.itsm_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserDto me(Authentication auth) {
        return userService.me(auth.getName());
    }
}
