
package com.internshipportal;

import com.internshipportal.model.User;
import com.internshipportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_EMAIL:}") String adminEmail,
            @Value("${ADMIN_PASSWORD:}") String adminPassword) {

        return args -> {
            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                System.out.println(
                    "Admin initialization skipped: credentials are not configured.");
                return;
            }

            userRepository.findByEmail(adminEmail).ifPresentOrElse(
                user -> {
                    if (user.getRole() != User.Role.ADMIN) {
                        System.out.println(
                            "Admin email already exists with a non-admin role. "
                            + "No changes made.");
                    }
                },
                () -> {
                    User admin = new User();
                    admin.setName("Administrator");
                    admin.setEmail(adminEmail);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setRole(User.Role.ADMIN);

                    userRepository.save(admin);
                    System.out.println("Initial admin account created.");
                }
            );
        };
    }
}
