package com.billcom.itsm_backend.service;

import com.billcom.itsm_backend.dto.CommentDto;
import com.billcom.itsm_backend.entity.Comment;
import com.billcom.itsm_backend.entity.Ticket;
import com.billcom.itsm_backend.entity.User;
import com.billcom.itsm_backend.repository.CommentRepository;
import com.billcom.itsm_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository comments;
    private final UserRepository users;
    private final TicketService ticketService;
    private final NotificationService notifications;

    @Transactional(readOnly = true)
    public List<CommentDto> list(Long ticketId, String email) {
        ticketService.getAccessible(ticketId, email);
        return comments.findByTicketIdOrderByCreatedAtAsc(ticketId).stream().map(CommentDto::from).toList();
    }

    @Transactional
    public CommentDto add(Long ticketId, String content, String email) {
        Ticket t = ticketService.getAccessible(ticketId, email);
        User author = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu"));
        Comment c = new Comment();
        c.setTicket(t);
        c.setAuthor(author);
        c.setContent(content);
        comments.save(c);

        String msg = "Nouveau commentaire sur le ticket #" + t.getId();
        if (!t.getRequester().getId().equals(author.getId())) notifications.send(t.getRequester(), msg);
        if (t.getAssignee() != null && !t.getAssignee().getId().equals(author.getId())) {
            notifications.send(t.getAssignee(), msg);
        }
        return CommentDto.from(c);
    }
}
