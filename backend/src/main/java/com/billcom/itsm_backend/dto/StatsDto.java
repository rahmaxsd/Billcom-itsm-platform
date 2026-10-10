package com.billcom.itsm_backend.dto;

import java.util.Map;

public record StatsDto(long total, long open, long inProgress, long resolved,
                       double avgResolutionHours, double resolutionRate,
                       Map<String, Long> byCategory, Map<String, Long> byTechnician) {}
