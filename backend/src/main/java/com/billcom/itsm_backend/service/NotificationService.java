package com.billcom.itsm_backend.service;

import com.billcom.itsm_backend.dto.NotificationDto;
import com.billcom.itsm_backend.entity.Notification;
import com.billcom.itsm_backend.entity.User;
import com.billcom.itsm_backend.repository.NotificationRepository;
import com.billcom.itsm_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifications;
    private final UserRepository users;
    private final SimpMessagingTemplate messaging;

    @Transactional
    public void send(User user, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        notifications.save(n);
        messaging.convertAndSendToUser(user.getEmail(), "/queue/notifications", NotificationDto.from(n));
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> mine(String email) {
        User u = currentUser(email);
        return notifications.findByUserIdOrderByCreatedAtDesc(u.getId()).stream()
                .map(NotificationDto::from).toList();
    }

    @Transactional
    public NotificationDto markRead(Long id, String email) {
        User u = currentUser(email);
        Notification n = notifications.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable"));
        if (!n.getUser().getId().equals(u.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        }
        n.setRead(true);
        return NotificationDto.from(notifications.save(n));
    }

    private User currentUser(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu"));
    }
}
