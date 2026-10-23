
package com.internshipportal.controller;

import com.internshipportal.model.Application;
import com.internshipportal.model.User;
import com.internshipportal.repository.ApplicationRepository;
import com.internshipportal.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class ChatController {

    private static final Logger logger =
            LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    @PostMapping("/message")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> handleMessage(
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, String> response = new HashMap<>();

        if (userDetails == null || userDetails.getUsername() == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String message = body == null ? "" : body.getOrDefault("message", "");
        message = message == null ? "" : message.toLowerCase().trim();

        if (message.isEmpty()) {
            response.put("error", "Message cannot be empty");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String email = userDetails.getUsername();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new IllegalStateException("Authenticated user not found"));

            String reply = generateReply(message, user);

            response.put("reply", reply);
            response.put("type", "bot");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing chatbot message", e);

            response.put("error", "Unable to process your message right now.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }
    }

    private String generateReply(String message, User user) {
        Long userId = user.getId();

        String fullName = user.getName();
        String name = (fullName == null || fullName.isBlank())
                ? "there"
                : fullName.trim().split("\\s+")[0];

        if (message.contains("status")) {
            Page<Application> apps =
                    applicationRepository.findByUserIdOrderByAppliedAtDesc(
                            userId,
                            PageRequest.of(
                                    0, 5,
                                    Sort.by("appliedAt").descending()
                            )
                    );

            if (apps.isEmpty()) {
                return "Hi " + name
                        + "! You haven't applied to any internships yet. "
                        + "Browse internships and apply now! 🚀";
            }

            StringBuilder sb = new StringBuilder(
                    "Hi " + name
                            + "! Here are your recent application statuses:\n\n"
            );

            apps.getContent().forEach(app -> {
                String statusEmoji = getStatusEmoji(app.getStatus());

                sb.append("• ")
                        .append(app.getInternship().getTitle())
                        .append(" @ ")
                        .append(app.getInternship().getCompany())
                        .append(" → ")
                        .append(statusEmoji)
                        .append("\n");
            });

            return sb.toString();
        }

        if (message.contains("last application")
                || message.contains("recent application")
                || message.contains("latest application")) {

            Page<Application> apps =
                    applicationRepository.findByUserIdOrderByAppliedAtDesc(
                            userId,
                            PageRequest.of(
                                    0, 1,
                                    Sort.by("appliedAt").descending()
                            )
                    );

            if (apps.isEmpty()) {
                return "You haven't applied to any internships yet, "
                        + name + ". Start exploring! 🔍";
            }

            Application last = apps.getContent().get(0);

            return "Your last application:\n\n"
                    + "📋 **" + last.getInternship().getTitle() + "**\n"
                    + "🏢 " + last.getInternship().getCompany() + "\n"
                    + "📍 " + last.getInternship().getLocation() + "\n"
                    + "Status: " + getStatusEmoji(last.getStatus()) + "\n"
                    + "Applied: " + last.getAppliedAt().toLocalDate();
        }

        if (message.contains("how many") && message.contains("appl")) {
            long count = applicationRepository.countByUserId(userId);

            return "You have applied to **" + count + "** internship"
                    + (count == 1 ? "" : "s")
                    + " so far, " + name + "! 🎯";
        }

        if (message.contains("shortlist")
                || message.contains("approved")
                || message.contains("accepted")) {

            List<Application> shortlisted =
                    applicationRepository.findByUserIdAndStatus(
                            userId,
                            Application.ApplicationStatus.SHORTLISTED
                    );

            if (shortlisted.isEmpty()) {
                return "No shortlisted applications yet, " + name
                        + ". Keep applying — your next one could be it! 💪";
            }

            StringBuilder sb = new StringBuilder(
                    "🎉 Great news! You're shortlisted for:\n\n"
            );

            shortlisted.forEach(app ->
                    sb.append("✅ ")
                            .append(app.getInternship().getTitle())
                            .append(" @ ")
                            .append(app.getInternship().getCompany())
                            .append("\n")
            );

            return sb.toString();
        }

        if (message.contains("reject")) {
            List<Application> rejected =
                    applicationRepository.findByUserIdAndStatus(
                            userId,
                            Application.ApplicationStatus.REJECTED
                    );

            if (rejected.isEmpty()) {
                return "No rejections! Keep going, " + name + "! 🌟";
            }

            return "You have " + rejected.size()
                    + " rejected application(s). Don't give up — "
                    + "each rejection brings you closer! 💪";
        }

        if (message.contains("hello")
                || message.equals("hi")
                || message.startsWith("hi ")
                || message.equals("hey")
                || message.startsWith("hey ")) {

            return "Hello " + name + "! 👋 I'm your Internship Assistant. "
                    + "I can help with:\n\n"
                    + "• \"What is my application status?\"\n"
                    + "• \"Show my last application\"\n"
                    + "• \"How many internships have I applied to?\"\n"
                    + "• \"Am I shortlisted anywhere?\"\n\n"
                    + "What would you like to know?";
        }

        if (message.contains("help")) {
            return "Here's what I can do for you, " + name + ":\n\n"
                    + "📊 **Application Status** – Your current statuses\n"
                    + "📋 **Last Application** – Most recent application\n"
                    + "🔢 **Count** – Total internships applied to\n"
                    + "✅ **Shortlisted** – Where you've been shortlisted\n\n"
                    + "Just type your question naturally!";
        }

        return "Hi " + name + "! I didn't quite get that. Try:\n\n"
                + "• \"What is my application status?\"\n"
                + "• \"Show my last application\"\n"
                + "• \"How many applications do I have?\"\n\n"
                + "Type **help** to see all options.";
    }

    private String getStatusEmoji(Application.ApplicationStatus status) {
        if (status == null) {
            return "UNKNOWN";
        }

        return switch (status) {
            case APPLIED -> "🟡 APPLIED";
            case SHORTLISTED -> "🟢 SHORTLISTED";
            case REJECTED -> "🔴 REJECTED";
        };
    }
}
