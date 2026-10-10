package com.billcom.itsm_backend.config;

import com.billcom.itsm_backend.entity.Role;
import com.billcom.itsm_backend.entity.User;
import com.billcom.itsm_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Value("${app.seed.password}")
    private String seedPassword;

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;
        create("Admin ITSM", "admin@billcom.com", Role.ADMIN);
        create("Technicien Test", "tech@billcom.com", Role.TECHNICIAN);
        create("Employé Test", "user@billcom.com", Role.USER);
        log.warn("Comptes de test créés : admin@billcom.com, tech@billcom.com, user@billcom.com");
    }

    private void create(String name, String email, Role role) {
        User u = new User();
        u.setFullName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode(seedPassword));
        u.setRole(role);
        users.save(u);
    }
}
