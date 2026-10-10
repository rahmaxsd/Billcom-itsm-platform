package com.billcom.itsm_backend.controller;

import com.billcom.itsm_backend.dto.NotificationDto;
import com.billcom.itsm_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> mine(Authentication auth) { return notificationService.mine(auth.getName()); }

    @PatchMapping("/{id}/read")
    public NotificationDto read(@PathVariable Long id, Authentication auth) {
        return notificationService.markRead(id, auth.getName());
    }
}
