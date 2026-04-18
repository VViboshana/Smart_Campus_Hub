package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.TicketSLADTO;
import com.smartcampus.service.TicketSLAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketSLAController {

    private final TicketSLAService ticketSLAService;

    @GetMapping("/{ticketId}/sla")
    public ResponseEntity<ApiResponse<TicketSLADTO>> getSLA(@PathVariable String ticketId) {
        return ResponseEntity.ok(ApiResponse.success("SLA fetched", ticketSLAService.getSLA(ticketId)));
    }
}
