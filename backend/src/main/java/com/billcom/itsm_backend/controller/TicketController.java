package com.billcom.itsm_backend.controller;

import com.billcom.itsm_backend.dto.*;
import com.billcom.itsm_backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDto create(@Valid @RequestBody CreateTicketRequest request, Authentication auth) {
        return ticketService.create(request, auth.getName());
    }

    @GetMapping("/mine")
    public List<TicketDto> mine(Authentication auth) { return ticketService.mine(auth.getName()); }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public List<TicketDto> assigned(Authentication auth) { return ticketService.assigned(auth.getName()); }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<TicketDto> all() { return ticketService.all(); }

    @GetMapping("/{id}")
    public TicketDto get(@PathVariable Long id, Authentication auth) {
        return ticketService.get(id, auth.getName());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public TicketDto status(@PathVariable Long id, @Valid @RequestBody StatusRequest request, Authentication auth) {
        return ticketService.updateStatus(id, request.status(), auth.getName());
    }

    @PatchMapping("/{id}/take")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TicketDto take(@PathVariable Long id, Authentication auth) {
        return ticketService.take(id, auth.getName());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public TicketDto assign(@PathVariable Long id, @Valid @RequestBody AssignRequest request) {
        return ticketService.assign(id, request.technicianId());
    }
}
