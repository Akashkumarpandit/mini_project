package com.example.auth.dto;

import com.example.auth.entity.User;
import java.time.LocalDateTime;
import java.util.Set;

public class UserDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String role;
    private Set<String> roles;
    private String avatarUrl;
    private boolean verified;
    private LocalDateTime createdAt;

    public UserDTO() {}

    public UserDTO(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.role = user.getRole();
            this.roles = user.getRoles();
            this.avatarUrl = user.getAvatarUrl();
            this.verified = user.isVerified();
            this.createdAt = user.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
