package com.billcom.itsm_backend.service;

import com.billcom.itsm_backend.dto.CreateUserRequest;
import com.billcom.itsm_backend.dto.UserDto;
import com.billcom.itsm_backend.entity.Role;
import com.billcom.itsm_backend.entity.User;
import com.billcom.itsm_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Transactional(readOnly = true)
    public UserDto me(String email) {
        return users.findByEmail(email).map(UserDto::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu"));
    }

    @Transactional(readOnly = true)
    public List<UserDto> list() {
        return users.findAll().stream().map(UserDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> technicians() {
        return users.findByRole(Role.TECHNICIAN).stream().map(UserDto::from).toList();
    }

    @Transactional
    public UserDto create(CreateUserRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email existe déjà");
        }
        User u = new User();
        u.setFullName(r.fullName());
        u.setEmail(email);
        u.setPassword(encoder.encode(r.password()));
        u.setRole(r.role());
        return UserDto.from(users.save(u));
    }
}
