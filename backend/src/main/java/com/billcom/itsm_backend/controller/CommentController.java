package com.billcom.itsm_backend.controller;

import com.billcom.itsm_backend.dto.CommentDto;
import com.billcom.itsm_backend.dto.CommentRequest;
import com.billcom.itsm_backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public List<CommentDto> list(@PathVariable Long ticketId, Authentication auth) {
        return commentService.list(ticketId, auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentDto add(@PathVariable Long ticketId, @Valid @RequestBody CommentRequest request,
                          Authentication auth) {
        return commentService.add(ticketId, request.content(), auth.getName());
    }
}
