package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.Role;
import com.billcom.itsm_backend.entity.User;
import java.time.LocalDateTime;

public record UserDto(Long id, String fullName, String email, Role role, LocalDateTime createdAt) {
    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getCreatedAt());
    }
}
