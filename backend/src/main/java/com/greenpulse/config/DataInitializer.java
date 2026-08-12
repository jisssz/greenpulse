package com.greenpulse.config;

import com.greenpulse.entity.Role;
import com.greenpulse.entity.User;
import com.greenpulse.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed default demo accounts safely if missing
        createDemoUserIfMissing("Citizen Demo", "citizen@greenpulse.demo", Role.CITIZEN);
        createDemoUserIfMissing("Inspector Vikram Roy", "authority@greenpulse.demo", Role.AUTHORITY_OFFICER);
        createDemoUserIfMissing("Inspector Vikram Roy", "officer@greenpulse.demo", Role.AUTHORITY_OFFICER);
        createDemoUserIfMissing("Moderator Alex", "moderator@greenpulse.demo", Role.MODERATOR);
        createDemoUserIfMissing("Field Worker Sam", "worker@greenpulse.demo", Role.FIELD_WORKER);
        createDemoUserIfMissing("System Admin", "admin@greenpulse.demo", Role.ADMIN);

        // Ensure passwords for all existing users are properly BCrypt encoded
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getPasswordHash() == null || !user.getPasswordHash().startsWith("$2")) {
                user.setPasswordHash(passwordEncoder.encode("password123"));
                userRepository.save(user);
            }
        }
    }

    private void createDemoUserIfMissing(String name, String email, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setPhone("+919876543210");
            user.setRole(role);
            user.setIsActive(true);
            userRepository.save(user);
        }
    }
}
