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

        if (message.contains("status") || message.contains("application status")) {
            Page<Application> apps = applicationRepository.findByUserIdOrderByAppliedAtDesc(
                    userId, PageRequest.of(0, 5, Sort.by("appliedAt").descending()));

            if (apps.isEmpty()) {
                return "Hi " + name + "! You haven't applied to any internships yet. Browse internships and apply now! \uD83D\uDE80";
            }

            StringBuilder sb = new StringBuilder("Hi " + name + "! Here are your recent application statuses:\n\n");
            apps.getContent().forEach(app -> {
                String statusEmoji = switch (app.getStatus()) {
                    case APPLIED -> "\uD83D\uDFE1 APPLIED";
                    case SHORTLISTED -> "\uD83D\uDFE2 SHORTLISTED";
                    case REJECTED -> "\uD83D\uDD34 REJECTED";
                };
                sb.append("\u2022 ").append(app.getInternship().getTitle())
                  .append(" @ ").append(app.getInternship().getCompany())
                  .append(" \u2192 ").append(statusEmoji).append("\n");
            });
            return sb.toString();
        }

        if (message.contains("last application") || message.contains("recent application") || message.contains("latest application")) {
            Page<Application> apps = applicationRepository.findByUserIdOrderByAppliedAtDesc(
                    userId, PageRequest.of(0, 1, Sort.by("appliedAt").descending()));

            if (apps.isEmpty()) {
                return "You haven't applied to any internships yet, " + name + ". Start exploring! \uD83D\uDD0D";
            }

            Application last = apps.getContent().get(0);
            String statusEmoji = switch (last.getStatus()) {
                case APPLIED -> "\uD83D\uDFE1 APPLIED";
                case SHORTLISTED -> "\uD83D\uDFE2 SHORTLISTED";
                case REJECTED -> "\uD83D\uDD34 REJECTED";
            };
            return "Your last application:\n\n" +
                   "\uD83D\uDCCB **" + last.getInternship().getTitle() + "**\n" +
                   "\uD83C\uDFE2 " + last.getInternship().getCompany() + "\n" +
                   "\uD83D\uDCCD " + last.getInternship().getLocation() + "\n" +
                   "Status: " + statusEmoji + "\n" +
                   "Applied: " + last.getAppliedAt().toLocalDate();
        }

        if (message.contains("how many") && message.contains("appl")) {
            long count = applicationRepository.countByUserId(userId);
            return "You have applied to **" + count + "** internship" + (count == 1 ? "" : "s") + " so far, " + name + "! \uD83C\uDFAF";
        }

        if (message.contains("shortlist") || message.contains("approved") || message.contains("accepted")) {
            List<Application> shortlisted = applicationRepository.findByUserIdAndStatus(
                    userId, Application.ApplicationStatus.SHORTLISTED);
            if (shortlisted.isEmpty()) {
                return "No shortlisted applications yet, " + name + ". Keep applying \u2014 your next one could be it! \uD83D\uDCAA";
            }
            StringBuilder sb = new StringBuilder("\uD83C\uDF89 Great news! You're shortlisted for:\n\n");
            shortlisted.forEach(app -> sb.append("\u2705 ")
                .append(app.getInternship().getTitle()).append(" @ ")
                .append(app.getInternship().getCompany()).append("\n"));
            return sb.toString();
        }

        if (message.contains("reject")) {
            List<Application> rejected = applicationRepository.findByUserIdAndStatus(
                    userId, Application.ApplicationStatus.REJECTED);
            if (rejected.isEmpty()) {
                return "No rejections! Keep going, " + name + "! \uD83C\uDF1F";
            }
            return "You have " + rejected.size() + " rejected application(s). Don't give up \u2014 each rejection brings you closer! \uD83D\uDCAA";
        }

        if (message.contains("hello") || message.contains("hi") || message.contains("hey")) {
            return "Hello " + name + "! \uD83D\uDC4B I'm your Internship Assistant. I can help with:\n\n" +
                   "\u2022 \"What is my application status?\"\n" +
                   "\u2022 \"Show my last application\"\n" +
                   "\u2022 \"How many internships have I applied to?\"\n" +
                   "\u2022 \"Am I shortlisted anywhere?\"\n\n" +
                   "What would you like to know?";
        }

        if (message.contains("help")) {
            return "Here's what I can do for you, " + name + ":\n\n" +
                   "\uD83D\uDCCA **Application Status** \u2013 Your current statuses\n" +
                   "\uD83D\uDCCB **Last Application** \u2013 Most recent application\n" +
                   "\uD83D\uDD22 **Count** \u2013 Total internships applied to\n" +
                   "\u2705 **Shortlisted** \u2013 Where you've been shortlisted\n\n" +
                   "Just type your question naturally!";
        }

        return "Hi " + name + "! I didn't quite get that. Try:\n\n" +
               "\u2022 \"What is my application status?\"\n" +
               "\u2022 \"Show my last application\"\n" +
               "\u2022 \"How many applications do I have?\"\n\n" +
               "Type **help** to see all options.";
    }
}
