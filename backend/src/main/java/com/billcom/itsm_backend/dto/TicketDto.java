package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.*;
import java.time.LocalDateTime;

public record TicketDto(Long id, String title, String description, Priority priority, TicketStatus status,
                        String category, Long requesterId, String requesterName,
                        Long assigneeId, String assigneeName,
                        LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime resolvedAt) {
    public static TicketDto from(Ticket t) {
        User a = t.getAssignee();
        return new TicketDto(t.getId(), t.getTitle(), t.getDescription(), t.getPriority(), t.getStatus(),
                t.getCategory().getName(), t.getRequester().getId(), t.getRequester().getFullName(),
                a == null ? null : a.getId(), a == null ? null : a.getFullName(),
                t.getCreatedAt(), t.getUpdatedAt(), t.getResolvedAt());
    }
}
