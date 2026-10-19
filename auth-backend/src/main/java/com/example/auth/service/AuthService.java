package com.example.auth.service;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.MessageResponse;
import com.example.auth.dto.SignupRequest;
import com.example.auth.dto.UserDTO;
import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import com.example.auth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isVerified(),
                roles
        );
    }

    public MessageResponse register(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        String primaryRole = request.getRole() != null && !request.getRole().isBlank()
                ? request.getRole().toUpperCase()
                : "TENANT";

        // Validate allowed roles
        if (!List.of("TENANT", "OWNER", "AGENT", "ADMIN").contains(primaryRole)) {
            primaryRole = "TENANT";
        }

        Set<String> roles = new HashSet<>();
        roles.add(primaryRole);
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            roles.addAll(request.getRoles());
        }

        User user = User.builder()
                .username(request.getUsername())
                .name(request.getName() != null && !request.getName().isBlank() ? request.getName() : request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(primaryRole)
                .verified(false)
                .roles(roles)
                .build();

        userRepository.save(user);
        return new MessageResponse("User registered successfully as " + primaryRole + "!");
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return new UserDTO(user);
    }
}
