package com.billcom.itsm_backend.controller;

import com.billcom.itsm_backend.dto.CategoryDto;
import com.billcom.itsm_backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final TicketService ticketService;

    @GetMapping
    public List<CategoryDto> list() { return ticketService.categories(); }
}
