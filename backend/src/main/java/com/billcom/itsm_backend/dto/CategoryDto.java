package com.billcom.itsm_backend.dto;

import com.billcom.itsm_backend.entity.Category;

public record CategoryDto(Long id, String name) {
    public static CategoryDto from(Category c) { return new CategoryDto(c.getId(), c.getName()); }
}
