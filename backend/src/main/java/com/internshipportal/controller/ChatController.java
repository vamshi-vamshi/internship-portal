
package com.internshipportal.controller;

import com.internshipportal.model.Application;
import com.internshipportal.model.User;
import com.internshipportal.repository.ApplicationRepository;
import com.internshipportal.repository.InternshipRepository;
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

    @Autowired
    private InternshipRepository internshipRepository;

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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        String message = body == null ? "" : body.get("message");
        message = message == null ? "" : message.toLowerCase().trim();

        if (message.isEmpty()) {
            response.put("error", "Message cannot be empty");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() ->
                            new IllegalStateException("Authenticated user not found"));

            String reply;

            if (user.getRole() == User.Role.ADMIN) {
                reply = generateAdminReply(message, user);
            } else {
                reply = generateUserReply(message, user);
            }

            response.put("reply", reply);
            response.put("type", "bot");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error processing chatbot message", e);

            response.put("error",
                    "Unable to process your message right now.");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }
    }

    // ==================== ADMIN CHATBOT ====================

    private String generateAdminReply(String message, User admin) {

        String name = getFirstName(admin);

        long totalUsers = userRepository.count();
        long totalInternships = internshipRepository.count();
        long totalApplications = applicationRepository.count();

        long pendingApplications = applicationRepository.countByStatus(
                Application.ApplicationStatus.APPLIED);

        long shortlistedApplications = applicationRepository.countByStatus(
                Application.ApplicationStatus.SHORTLISTED);

        long rejectedApplications = applicationRepository.countByStatus(
                Application.ApplicationStatus.REJECTED);

        if (containsAny(message,
                "hello", "hi", "hey", "good morning", "good afternoon")) {

            return "Hello " + name + "! 👋 Welcome to the Admin Assistant.\n\n"
                    + "I can help you monitor your internship portal:\n\n"
                    + "• How many users are registered?\n"
                    + "• How many internships are available?\n"
                    + "• How many applications are submitted?\n"
                    + "• How many applications are pending?\n"
                    + "• How many students are shortlisted?\n"
                    + "• Show dashboard statistics\n\n"
                    + "What would you like to know?";
        }

        if (message.contains("help")) {
            return "🛡️ Admin Assistant Commands\n\n"
                    + "👥 Total users / Number of users\n"
                    + "💼 Total internships / Available internships\n"
                    + "📋 Total applications\n"
                    + "🟡 Pending applications\n"
                    + "🟢 Shortlisted applications\n"
                    + "🔴 Rejected applications\n"
                    + "📊 Dashboard statistics\n\n"
                    + "Ask your question in natural language.";
        }

        if (containsAny(message,
                "dashboard", "all statistics", "overall statistics",
                "portal statistics", "summary", "everything")) {

            return "📊 Internship Portal Dashboard\n\n"
                    + "👥 Total registered users: " + totalUsers + "\n"
                    + "💼 Total internships: " + totalInternships + "\n"
                    + "📋 Total applications: " + totalApplications + "\n\n"
                    + "🟡 Pending applications: " + pendingApplications + "\n"
                    + "🟢 Shortlisted applications: "
                    + shortlistedApplications + "\n"
                    + "🔴 Rejected applications: " + rejectedApplications;
        }

        if (containsAny(message,
                "user", "users", "registered", "students", "people")) {

            return "👥 User Statistics\n\n"
                    + "Total registered users: " + totalUsers + "\n\n"
                    + "This count includes all records in the users table, "
                    + "including the admin account.";
        }

        if (containsAny(message,
                "internship", "internships", "openings", "positions")) {

            return "💼 Internship Statistics\n\n"
                    + "Total internships in the database: "
                    + totalInternships + "\n\n"
                    + "This is the total number of internship records, "
                    + "not necessarily the number of currently open positions.";
        }

        if (containsAny(message,
                "pending", "awaiting", "not reviewed", "not shortlisted")) {

            return "🟡 Pending Applications\n\n"
                    + "Applications with APPLIED status: "
                    + pendingApplications + "\n\n"
                    + "These applications have not yet been marked "
                    + "SHORTLISTED or REJECTED.";
        }

        if (containsAny(message,
                "shortlisted", "shortlist", "selected", "approved")) {

            return "🟢 Shortlisted Applications\n\n"
                    + "Total shortlisted applications: "
                    + shortlistedApplications;
        }

        if (containsAny(message, "rejected", "rejection", "reject")) {

            return "🔴 Rejected Applications\n\n"
                    + "Total rejected applications: " + rejectedApplications;
        }

        if (containsAny(message,
                "application", "applications", "applied", "submissions")) {

            return "📋 Application Statistics\n\n"
                    + "Total applications: " + totalApplications + "\n"
                    + "🟡 Pending: " + pendingApplications + "\n"
                    + "🟢 Shortlisted: " + shortlistedApplications + "\n"
                    + "🔴 Rejected: " + rejectedApplications;
        }

        return "Hi " + name + "! 👋 I'm your Admin Assistant.\n\n"
                + "Try asking:\n"
                + "• How many users are registered?\n"
                + "• How many internships are available?\n"
                + "• How many applications are pending?\n"
                + "• How many students are shortlisted?\n"
                + "• Show dashboard statistics\n\n"
                + "Type 'help' to see all commands.";
    }

    // ==================== NORMAL USER CHATBOT ====================

    private String generateUserReply(String message, User user) {

        Long userId = user.getId();
        String name = getFirstName(user);

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

            apps.getContent().forEach(app ->
                    sb.append("• ")
                            .append(app.getInternship().getTitle())
                            .append(" @ ")
                            .append(app.getInternship().getCompany())
                            .append(" → ")
                            .append(getStatusEmoji(app.getStatus()))
                            .append("\n")
            );

            return sb.toString();
        }

        if (containsAny(message,
                "last application", "recent application",
                "latest application")) {

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

        if (containsAny(message,
                "shortlist", "approved", "accepted")) {

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

        if (containsAny(message, "reject", "rejected", "rejections")) {

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

        if (containsAny(message, "hello", "hey")
                || message.equals("hi")
                || message.startsWith("hi ")) {

            return "Hello " + name + "! 👋 I'm your Internship Assistant.\n\n"
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

    // ==================== SHARED HELPERS ====================

    private String getFirstName(User user) {
        String fullName = user.getName();

        if (fullName == null || fullName.isBlank()) {
            return user.getRole() == User.Role.ADMIN ? "Administrator" : "there";
        }

        return fullName.trim().split("\\s+")[0];
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

    private boolean containsAny(String message, String... keywords) {
        for (String keyword : keywords) {
            if (message.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}
