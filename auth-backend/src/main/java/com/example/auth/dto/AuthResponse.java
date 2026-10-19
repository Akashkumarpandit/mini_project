package com.example.auth.dto;

import java.util.List;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String name;
    private String email;
    private String role;
    private boolean verified;
    private List<String> roles;

    public AuthResponse(String accessToken, Long id, String username, String email, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        if (roles != null && !roles.isEmpty()) {
            this.role = roles.get(0).replace("ROLE_", "");
        }
    }

    public AuthResponse(String accessToken, Long id, String username, String name, String email, String role, boolean verified, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.role = role;
        this.verified = verified;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
