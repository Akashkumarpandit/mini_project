package com.example.auth;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.MessageResponse;
import com.example.auth.dto.SignupRequest;
import com.example.auth.dto.UserDTO;
import com.example.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    public void testUserRegistrationAndLogin() {
        String testUser = "testuser_" + System.currentTimeMillis();
        String testEmail = testUser + "@example.com";

        SignupRequest signup = new SignupRequest();
        signup.setUsername(testUser);
        signup.setName("Test User");
        signup.setEmail(testEmail);
        signup.setPassword("Password123!");
        signup.setRole("TENANT");

        MessageResponse signupRes = authService.register(signup);
        assertNotNull(signupRes);
        assertTrue(signupRes.getMessage().contains("successfully"));

        // Login
        LoginRequest login = new LoginRequest();
        login.setUsername(testUser);
        login.setPassword("Password123!");

        AuthResponse authRes = authService.login(login);
        assertNotNull(authRes);
        assertNotNull(authRes.getToken());
        assertEquals(testUser, authRes.getUsername());
        assertEquals("TENANT", authRes.getRole());

        // Get Current User
        UserDTO userDto = authService.getCurrentUser(testUser);
        assertNotNull(userDto);
        assertEquals(testEmail, userDto.getEmail());
    }

    @Test
    public void testDuplicateUsernamePrevention() {
        SignupRequest signup1 = new SignupRequest();
        signup1.setUsername("duplicate_check");
        signup1.setEmail("dup1@example.com");
        signup1.setPassword("secret123");
        authService.register(signup1);

        SignupRequest signup2 = new SignupRequest();
        signup2.setUsername("duplicate_check");
        signup2.setEmail("dup2@example.com");
        signup2.setPassword("secret123");
        MessageResponse res = authService.register(signup2);

        assertTrue(res.getMessage().contains("Error: Username is already taken"));
    }
}
