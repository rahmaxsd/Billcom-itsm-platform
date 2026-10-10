package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record StatusRequest(@NotNull TicketStatus status) {}
