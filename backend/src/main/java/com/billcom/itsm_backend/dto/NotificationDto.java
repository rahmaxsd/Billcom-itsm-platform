package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.Notification;
import java.time.LocalDateTime;

public record NotificationDto(Long id, String message, boolean read, LocalDateTime createdAt) {
    public static NotificationDto from(Notification n) {
        return new NotificationDto(n.getId(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
