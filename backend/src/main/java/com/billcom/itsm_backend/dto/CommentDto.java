package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.Comment;
import java.time.LocalDateTime;

public record CommentDto(Long id, Long ticketId, Long authorId, String authorName,
                         String content, LocalDateTime createdAt) {
    public static CommentDto from(Comment c) {
        return new CommentDto(c.getId(), c.getTicket().getId(), c.getAuthor().getId(),
                c.getAuthor().getFullName(), c.getContent(), c.getCreatedAt());
    }
}
