import os

# Delete old services
try: os.remove("src/main/java/com/example/myapp/service/NoteService.java")
except: pass
try: os.remove("src/main/java/com/example/myapp/service/PropertyService.java")
except: pass

# Fix UserRepository.java
repo_file = "src/main/java/com/example/myapp/repository/UserRepository.java"
with open(repo_file, "r") as f: content = f.read()

if "findByUsername" not in content:
    content = content.replace("}", "    java.util.Optional<com.example.myapp.entity.User> findByUsername(String username);\n    Boolean existsByUsername(String username);\n    Boolean existsByEmail(String email);\n}")
    with open(repo_file, "w") as f: f.write(content)

# Patch User.java
user_file = "src/main/java/com/example/myapp/entity/User.java"
with open(user_file, "r") as f: user_content = f.read()

# Change userId to id to match old methods
user_content = user_content.replace("private Long userId;", "private Long id;")
user_content = user_content.replace("getUserId", "getId")
user_content = user_content.replace("setUserId", "setId")

# Add missing fields (username, roles) for Spring Security
if "private String username;" not in user_content:
    insert_idx = user_content.find("private String name;")
    user_content = user_content[:insert_idx] + "private String username;\n    " + user_content[insert_idx:]
    
    # Add getters/setters
    user_content = user_content.replace("}", """
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role_name")
    private java.util.Set<String> roles = new java.util.HashSet<>();
    public java.util.Set<String> getRoles() { return roles; }
    public void setRoles(java.util.Set<String> roles) { this.roles = roles; }

    public static UserBuilder builder() { return new UserBuilder(); }
    public static class UserBuilder {
        private User user = new User();
        public UserBuilder username(String username) { user.setUsername(username); return this; }
        public UserBuilder email(String email) { user.setEmail(email); return this; }
        public UserBuilder password(String password) { user.setPassword(password); return this; }
        public UserBuilder role(String role) { user.setRole(role); return this; }
        public User build() { return user; }
    }
}
""")

with open(user_file, "w") as f: f.write(user_content)

print("Services and User.java fixed!")
