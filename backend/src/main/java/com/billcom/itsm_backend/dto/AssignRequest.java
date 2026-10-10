package com.billcom.itsm_backend.dto;

import jakarta.validation.constraints.NotNull;

public record AssignRequest(@NotNull Long technicianId) {}
