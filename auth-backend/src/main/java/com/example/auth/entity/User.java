package com.example.auth.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String username;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String googleId;
    private String multiFactorSecret;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role_name")
    private Set<String> roles = new HashSet<>();

    public User() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getMultiFactorSecret() { return multiFactorSecret; }
    public void setMultiFactorSecret(String multiFactorSecret) { this.multiFactorSecret = multiFactorSecret; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public static UserBuilder builder() { return new UserBuilder(); }
    public static class UserBuilder {
        private User user = new User();
        public UserBuilder id(Long id) { user.setId(id); return this; }
        public UserBuilder username(String username) { user.setUsername(username); return this; }
        public UserBuilder name(String name) { user.setName(name); return this; }
        public UserBuilder email(String email) { user.setEmail(email); return this; }
        public UserBuilder password(String password) { user.setPassword(password); return this; }
        public UserBuilder role(String role) { user.setRole(role); return this; }
        public UserBuilder roles(Set<String> roles) { user.setRoles(roles); return this; }
        public User build() { return user; }
    }
}
