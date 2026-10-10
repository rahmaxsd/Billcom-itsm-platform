package com.billcom.itsm_backend.controller;

import com.billcom.itsm_backend.dto.CreateUserRequest;
import com.billcom.itsm_backend.dto.StatsDto;
import com.billcom.itsm_backend.dto.UserDto;
import com.billcom.itsm_backend.service.StatsService;
import com.billcom.itsm_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final StatsService statsService;

    @GetMapping("/users")
    public List<UserDto> users() { return userService.list(); }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping("/technicians")
    public List<UserDto> technicians() { return userService.technicians(); }

    @GetMapping("/stats")
    public StatsDto stats() { return statsService.compute(); }
}
