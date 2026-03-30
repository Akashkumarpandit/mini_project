import os

dto_dir = "src/main/java/com/example/myapp/dto"
os.makedirs(dto_dir, exist_ok=True)

dtos = {
    "MessageResponse.java": """package com.example.myapp.dto;
public class MessageResponse {
    private String message;
    public MessageResponse(String message) { this.message = message; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
""",
    "LoginRequest.java": """package com.example.myapp.dto;
import jakarta.validation.constraints.NotBlank;
public class LoginRequest {
    @NotBlank private String username;
    @NotBlank private String password;
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
""",
    "RegisterRequest.java": """package com.example.myapp.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;
public class RegisterRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    private Set<String> role;
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<String> getRole() { return role; }
    public void setRole(Set<String> role) { this.role = role; }
}
""",
    "JwtResponse.java": """package com.example.myapp.dto;
import java.util.List;
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
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
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
"""
}

for name, content in dtos.items():
    with open(os.path.join(dto_dir, name), "w") as f:
        f.write(content)

print("Auth DTOs recreated.")
