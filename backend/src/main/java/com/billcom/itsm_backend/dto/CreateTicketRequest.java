package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.Priority;
import jakarta.validation.constraints.*;

public record CreateTicketRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        @NotNull Priority priority,
        @NotNull Long categoryId) {}
