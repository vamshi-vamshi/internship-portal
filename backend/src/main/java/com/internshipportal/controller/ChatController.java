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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired private UserRepository userRepository;
    @Autowired private ApplicationRepository applicationRepository;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> handleMessage(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String message = body.getOrDefault("message", "").toLowerCase().trim();
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String reply = generateReply(message, user);

        Map<String, String> response = new HashMap<>();
        response.put("reply", reply);
        response.put("type", "bot");
        return ResponseEntity.ok(response);
    }

    private String generateReply(String message, User user) {
        Long userId = user.getId();
        String name = user.getName().split(" ")[0];

        // === Application Status Query ===
        if (message.contains("status") || message.contains("application status")) {
            Page<Application> apps = applicationRepository.findByUserIdOrderByAppliedAtDesc(
                    userId, PageRequest.of(0, 5, Sort.by("appliedAt").descending()));

            if (apps.isEmpty()) {
                return "Hi " + name + "! You haven't applied to any internships yet. Browse internships and apply now! 🚀";
            }

            StringBuilder sb = new StringBuilder("Hi " + name + "! Here are your recent application statuses:\n\n");
            apps.getContent().forEach(app -> {
                String statusEmoji = switch (app.getStatus()) {
                    case APPLIED -> "🟡 APPLIED";
                    case SHORTLISTED -> "🟢 SHORTLISTED";
                    case REJECTED -> "🔴 REJECTED";
                };
                sb.append("• ").append(app.getInternship().getTitle())
                  .append(" @ ").append(app.getInternship().getCompany())
                  .append(" → ").append(statusEmoji).append("\n");
            });
            return sb.toString();
        }

        // === Last Application Query ===
        if (message.contains("last application") || message.contains("recent application") || message.contains("latest application")) {
            Page<Application> apps = applicationRepository.findByUserIdOrderByAppliedAtDesc(
                    userId, PageRequest.of(0, 1, Sort.by("appliedAt").descending()));

            if (apps.isEmpty()) {
                return "You haven't applied to any internships yet, " + name + ". Start exploring! 🔍";
            }

            Application last = apps.getContent().get(0);
            String statusEmoji = switch (last.getStatus()) {
                case APPLIED -> "🟡 APPLIED";
                case SHORTLISTED -> "🟢 SHORTLISTED";
                case REJECTED -> "🔴 REJECTED";
            };
            return "Your last application:\n\n" +
                   "📋 **" + last.getInternship().getTitle() + "**\n" +
                   "🏢 " + last.getInternship().getCompany() + "\n" +
                   "📍 " + last.getInternship().getLocation() + "\n" +
                   "Status: " + statusEmoji + "\n" +
                   "Applied: " + last.getAppliedAt().toLocalDate();
        }

        // === Count Applications ===
        if (message.contains("how many") && message.contains("appl")) {
            long count = applicationRepository.countByUserId(userId);
            return "You have applied to **" + count + "** internship" + (count == 1 ? "" : "s") + " so far, " + name + "! 🎯";
        }

        // === Shortlisted Query ===
        if (message.contains("shortlist") || message.contains("approved") || message.contains("accepted")) {
            List<Application> shortlisted = applicationRepository.findByUserIdAndStatus(
                    userId, Application.ApplicationStatus.SHORTLISTED);
            if (shortlisted.isEmpty()) {
                return "No shortlisted applications yet, " + name + ". Keep applying — your next one could be the one! 💪";
            }
            StringBuilder sb = new StringBuilder("🎉 Great news! You're shortlisted for:\n\n");
            shortlisted.forEach(app -> sb.append("✅ ")
                .append(app.getInternship().getTitle()).append(" @ ")
                .append(app.getInternship().getCompany()).append("\n"));
            return sb.toString();
        }

        // === Rejected Query ===
        if (message.contains("reject")) {
            List<Application> rejected = applicationRepository.findByUserIdAndStatus(
                    userId, Application.ApplicationStatus.REJECTED);
            if (rejected.isEmpty()) {
                return "No rejections! Keep going, " + name + "! 🌟";
            }
            return "You have " + rejected.size() + " rejected application(s). Don't give up — each rejection brings you closer to the right opportunity! 💪";
        }

        // === Help / Greetings ===
        if (message.contains("hello") || message.contains("hi") || message.contains("hey")) {
            return "Hello " + name + "! 👋 I'm your Internship Assistant. I can help you with:\n\n" +
                   "• \"What is my application status?\"\n" +
                   "• \"Show my last application\"\n" +
                   "• \"How many internships have I applied to?\"\n" +
                   "• \"Am I shortlisted anywhere?\"\n\n" +
                   "What would you like to know?";
        }

        if (message.contains("help")) {
            return "Here's what I can do for you, " + name + ":\n\n" +
                   "📊 **Application Status** – Ask about your current application statuses\n" +
                   "📋 **Last Application** – See your most recent application\n" +
                   "🔢 **Count** – How many internships you've applied to\n" +
                   "✅ **Shortlisted** – See where you're shortlisted\n\n" +
                   "Just type your question naturally!";
        }

        // === Default ===
        return "Hi " + name + "! I'm not sure I understood that. Try asking:\n\n" +
               "• \"What is my application status?\"\n" +
               "• \"Show my last application\"\n" +
               "• \"How many applications do I have?\"\n\n" +
               "Type **help** to see all options.";
    }
}
