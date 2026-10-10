package com.billcom.itsm_backend.service;

import com.billcom.itsm_backend.dto.StatsDto;
import com.billcom.itsm_backend.entity.Ticket;
import com.billcom.itsm_backend.entity.TicketStatus;
import com.billcom.itsm_backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final TicketRepository tickets;

    @Transactional(readOnly = true)
    public StatsDto compute() {
        List<Ticket> all = tickets.findAll();
        long total = all.size();
        long open = count(all, TicketStatus.OPEN);
        long inProgress = count(all, TicketStatus.IN_PROGRESS);
        long resolved = count(all, TicketStatus.RESOLVED);

        double avgHours = all.stream()
                .filter(t -> t.getResolvedAt() != null)
                .mapToLong(t -> Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes())
                .average().orElse(0) / 60.0;
        double rate = total == 0 ? 0 : resolved * 100.0 / total;

        Map<String, Long> byCategory = new TreeMap<>(all.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getName(), Collectors.counting())));
        Map<String, Long> byTechnician = new TreeMap<>(all.stream()
                .filter(t -> t.getAssignee() != null)
                .collect(Collectors.groupingBy(t -> t.getAssignee().getFullName(), Collectors.counting())));

        return new StatsDto(total, open, inProgress, resolved, round(avgHours), round(rate),
                byCategory, byTechnician);
    }

    private long count(List<Ticket> list, TicketStatus s) {
        return list.stream().filter(t -> t.getStatus() == s).count();
    }

    private double round(double v) { return Math.round(v * 10.0) / 10.0; }
}
