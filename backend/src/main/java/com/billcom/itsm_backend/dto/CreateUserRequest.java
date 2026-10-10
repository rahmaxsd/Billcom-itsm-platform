package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.Role;
import jakarta.validation.constraints.*;

public record CreateUserRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "8 caractères minimum") String password,
        @NotNull Role role) {}
