package com.billcom.itsm_backend.service;

import com.billcom.itsm_backend.dto.CategoryDto;
import com.billcom.itsm_backend.dto.CreateTicketRequest;
import com.billcom.itsm_backend.dto.TicketDto;
import com.billcom.itsm_backend.entity.*;
import com.billcom.itsm_backend.repository.CategoryRepository;
import com.billcom.itsm_backend.repository.TicketRepository;
import com.billcom.itsm_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository tickets;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final NotificationService notifications;

    private User user(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu"));
    }

    private Ticket find(Long id) {
        return tickets.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket introuvable"));
    }

    private boolean isAssignee(Ticket t, User u) {
        return t.getAssignee() != null && t.getAssignee().getId().equals(u.getId());
    }

    @Transactional(readOnly = true)
    public Ticket getAccessible(Long id, String email) {
        Ticket t = find(id);
        User u = user(email);
        boolean ok = u.getRole() == Role.ADMIN
                || t.getRequester().getId().equals(u.getId())
                || isAssignee(t, u);
        if (!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        return t;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> categories() {
        return categories.findAll().stream().map(CategoryDto::from).toList();
    }

    @Transactional
    public TicketDto create(CreateTicketRequest r, String email) {
        User u = user(email);
        Category c = categories.findById(r.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Catégorie invalide"));
        Ticket t = new Ticket();
        t.setTitle(r.title());
        t.setDescription(r.description());
        t.setPriority(r.priority());
        t.setCategory(c);
        t.setRequester(u);
        tickets.save(t);
        users.findByRole(Role.ADMIN).forEach(a ->
                notifications.send(a, "Nouveau ticket #" + t.getId() + " : " + t.getTitle()));
        return TicketDto.from(t);
    }

    @Transactional(readOnly = true)
    public List<TicketDto> mine(String email) {
        return tickets.findByRequesterIdOrderByCreatedAtDesc(user(email).getId())
                .stream().map(TicketDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> assigned(String email) {
        return tickets.findByAssigneeIdOrderByCreatedAtDesc(user(email).getId())
                .stream().map(TicketDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> all() {
        return tickets.findAllByOrderByCreatedAtDesc().stream().map(TicketDto::from).toList();
    }

    @Transactional(readOnly = true)
    public TicketDto get(Long id, String email) {
        return TicketDto.from(getAccessible(id, email));
    }

    @Transactional
    public TicketDto updateStatus(Long id, TicketStatus status, String email) {
        Ticket t = find(id);
        User u = user(email);
        if (!(u.getRole() == Role.ADMIN || isAssignee(t, u))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul le technicien assigné peut modifier le statut");
        }
        t.setStatus(status);
        t.setResolvedAt(status == TicketStatus.RESOLVED ? LocalDateTime.now() : null);
        tickets.save(t);
        notifications.send(t.getRequester(), "Ticket #" + t.getId() + " : statut " + status);
        return TicketDto.from(t);
    }

    @Transactional
    public TicketDto take(Long id, String email) {
        Ticket t = find(id);
        User u = user(email);
        if (t.getAssignee() != null && !isAssignee(t, u)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ticket déjà pris en charge");
        }
        t.setAssignee(u);
        t.setStatus(TicketStatus.IN_PROGRESS);
        tickets.save(t);
        notifications.send(t.getRequester(), "Ticket #" + t.getId() + " pris en charge par " + u.getFullName());
        return TicketDto.from(t);
    }

    @Transactional
    public TicketDto assign(Long id, Long technicianId) {
        Ticket t = find(id);
        User tech = users.findById(technicianId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Technicien introuvable"));
        if (tech.getRole() != Role.TECHNICIAN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'utilisateur n'est pas technicien");
        }
        t.setAssignee(tech);
        tickets.save(t);
        notifications.send(tech, "Ticket #" + t.getId() + " vous a été assigné");
        notifications.send(t.getRequester(), "Ticket #" + t.getId() + " assigné à " + tech.getFullName());
        return TicketDto.from(t);
    }
}
