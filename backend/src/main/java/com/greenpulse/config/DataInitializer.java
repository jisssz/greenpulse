package com.greenpulse.config;

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
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // Encode demo password reliably on startup
            user.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(user);
        }
    }
}
