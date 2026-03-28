package com.smartcampus.service;

import com.smartcampus.dto.response.ChatResponse;
import com.smartcampus.dto.response.ChatResponse.ActionButton;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ResourceRepository resourceRepository;

    // Reusable action buttons
    private static ActionButton nav(String label, String path, String icon) {
        return ActionButton.builder().label(label).type("navigate").value(path).icon(icon).build();
    }

    private static ActionButton query(String label, String queryText, String icon) {
        return ActionButton.builder().label(label).type("query").value(queryText).icon(icon).build();
    }

    private static ActionButton flow(String label, String flowName, String icon) {
        return ActionButton.builder().label(label).type("flow").value(flowName).icon(icon).build();
    }

    public ChatResponse processMessage(String message) {
        String msg = message.toLowerCase().trim();

        // Greeting
        if (matchesAny(msg, "hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings")) {
            return ChatResponse.builder()
                    .reply("👋 Hello! Welcome to the Smart Campus Hub assistant. I can **book resources**, **raise tickets**, navigate you around, and more!")
                    .category("greeting")
                    .suggestions(List.of())
                    .actions(List.of(
                            flow("📅 Book a Resource", "booking", "📅"),
                            flow("🎫 Raise a Ticket", "ticket", "🎫"),
                            nav("📋 Browse Resources", "/resources", "📋"),
                            nav("📅 My Bookings", "/bookings", "📅"),
                            nav("🎫 My Tickets", "/tickets", "🎫"),
                            query("❓ What can you do?", "What can you do?", "❓")
                    ))
                    .build();
        }

        // Farewell
        if (matchesAny(msg, "bye", "goodbye", "see you", "thanks bye", "thank you bye", "exit", "quit")) {
            return ChatResponse.builder()
                    .reply("👋 Goodbye! Feel free to come back anytime you need help. Have a great day!")
                    .category("farewell")
                    .suggestions(List.of())
                    .actions(List.of())
                    .build();
        }

        // Thanks
        if (matchesAny(msg, "thanks", "thank you", "thx", "ty", "appreciate")) {
            return ChatResponse.builder()
                    .reply("😊 You're welcome! Is there anything else I can help you with?")
                    .category("thanks")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("📋 Browse Resources", "/resources", "📋"),
                            nav("🎫 Create Ticket", "/tickets/create", "🎫"),
                            query("❓ What can you do?", "What can you do?", "❓")
                    ))
                    .build();
        }

        // About platform
        if (matchesAny(msg, "about", "what is this", "what is smart campus", "tell me about", "platform", "what does this do", "purpose")) {
            return ChatResponse.builder()
                    .reply("🏫 **Smart Campus Operations Hub** is a comprehensive campus management platform built for SLIIT. It allows you to:\n\n" +
                            "• **Browse & Book Resources** — Lecture halls, labs, projectors, study rooms\n" +
                            "• **Submit Support Tickets** — Report issues with campus facilities\n" +
                            "• **Track Notifications** — Stay updated on booking approvals and ticket status\n" +
                            "• **Admin Dashboard** — Manage resources, bookings, and users\n\n" +
                            "Use the quick actions below to get started!")
                    .category("about")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("📋 Browse Resources", "/resources", "📋"),
                            nav("📅 Book a Resource", "/resources", "📅"),
                            nav("🎫 Create a Ticket", "/tickets/create", "🎫"),
                            nav("🏠 Go to Dashboard", "/", "🏠")
                    ))
                    .build();
        }

        // Resources — availability / listing
        if (matchesAny(msg, "resource", "available resource", "what resource", "list resource", "show resource", "facilities", "rooms", "labs", "halls", "equipment")) {
            List<Resource> resources = resourceRepository.findAll();
            if (resources.isEmpty()) {
                return ChatResponse.builder()
                        .reply("📋 There are currently no resources listed in the system. An admin can add resources from the Resources management page.")
                        .category("resources")
                        .suggestions(List.of())
                        .actions(List.of(
                                nav("➕ Add Resource (Admin)", "/resources/create", "➕"),
                                query("❓ Help", "What can you do?", "❓")
                        ))
                        .build();
            }

            Map<ResourceType, List<Resource>> grouped = resources.stream()
                    .collect(Collectors.groupingBy(Resource::getType));

            StringBuilder sb = new StringBuilder("📋 **Available Campus Resources:**\n\n");
            for (Map.Entry<ResourceType, List<Resource>> entry : grouped.entrySet()) {
                sb.append("**").append(formatResourceType(entry.getKey())).append(":**\n");
                for (Resource r : entry.getValue()) {
                    sb.append("• ").append(r.getName());
                    if (r.getLocation() != null) sb.append(" — ").append(r.getLocation());
                    if (r.getCapacity() > 0) sb.append(" (Capacity: ").append(r.getCapacity()).append(")");
                    sb.append("\n");
                }
                sb.append("\n");
            }
            sb.append("Click a button below to take action!");

            // Build action buttons for each resource to book
            List<ActionButton> actions = new ArrayList<>();
            actions.add(nav("📋 View All Resources", "/resources", "📋"));
            for (Resource r : resources) {
                if (r.getId() != null) {
                    actions.add(nav("📅 Book: " + r.getName(), "/bookings/create/" + r.getId(), "📅"));
                }
            }

            return ChatResponse.builder()
                    .reply(sb.toString())
                    .category("resources")
                    .suggestions(List.of())
                    .actions(actions)
                    .build();
        }

        // Booking — how to / go book
        if (matchesAny(msg, "book", "booking", "reserve", "reservation", "how to book", "make a booking", "schedule")) {
            return ChatResponse.builder()
                    .reply("📅 **Ready to book a resource?**\n\nI can help you book one right here in the chat! Click the button below to start, or browse resources to pick one yourself.")
                    .category("booking")
                    .suggestions(List.of())
                    .actions(List.of(
                            flow("📅 Start Booking Now", "booking", "📅"),
                            nav("📋 Browse Resources", "/resources", "📋"),
                            nav("📅 View My Bookings", "/bookings", "📅"),
                            query("🔍 What resources are available?", "What resources are available?", "🔍")
                    ))
                    .build();
        }

        // My bookings
        if (matchesAny(msg, "my booking", "view booking", "check booking", "booking status", "see my booking", "where are my booking")) {
            return ChatResponse.builder()
                    .reply("📋 Here you can view all your bookings and their statuses:\n\n" +
                            "• 🟡 **Pending** — Awaiting admin approval\n" +
                            "• 🟢 **Approved** — Confirmed\n" +
                            "• 🔴 **Rejected** — Not approved\n" +
                            "• ⚪ **Cancelled** — You cancelled it\n\n" +
                            "Click the button below to go directly to your bookings!")
                    .category("booking")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("📅 Go to My Bookings", "/bookings", "📅"),
                            nav("📋 Browse Resources", "/resources", "📋"),
                            query("❌ How to cancel a booking?", "cancel booking", "❌")
                    ))
                    .build();
        }

        // Cancel booking
        if (matchesAny(msg, "cancel booking", "cancel my booking", "cancel reservation", "cancel a booking")) {
            return ChatResponse.builder()
                    .reply("❌ **To cancel a booking:**\n\n" +
                            "1. Go to **My Bookings**\n" +
                            "2. Find the booking (must be **Pending** status)\n" +
                            "3. Click **Cancel**\n\n" +
                            "Note: Only pending bookings can be cancelled.")
                    .category("booking")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("📅 Go to My Bookings", "/bookings", "📅"),
                            nav("📋 Browse Resources", "/resources", "📋")
                    ))
                    .build();
        }

        // Tickets — how to create
        if (matchesAny(msg, "ticket", "create ticket", "submit ticket", "report issue", "raise ticket", "support ticket", "maintenance", "issue", "problem", "complaint")) {
            return ChatResponse.builder()
                    .reply("🎫 **Need to report an issue?**\n\nI can help you create a ticket right here in the chat! Click the button below to start.")
                    .category("ticket")
                    .suggestions(List.of())
                    .actions(List.of(
                            flow("🎫 Start Ticket Now", "ticket", "🎫"),
                            nav("🎫 Create Ticket (Full Form)", "/tickets/create", "🎫"),
                            nav("📋 View My Tickets", "/tickets", "📋"),
                            query("📊 Check ticket status", "my ticket status", "📊")
                    ))
                    .build();
        }

        // Ticket status / my tickets
        if (matchesAny(msg, "my ticket", "ticket status", "check ticket", "view ticket", "track ticket")) {
            return ChatResponse.builder()
                    .reply("📋 **Your Ticket Statuses:**\n\n" +
                            "• 🟡 **Open** — Newly submitted\n" +
                            "• 🔵 **In Progress** — Being worked on\n" +
                            "• 🟢 **Resolved** — Issue fixed\n" +
                            "• ⚫ **Closed** — Ticket closed\n\n" +
                            "Click below to view your tickets or create a new one!")
                    .category("ticket")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("📋 View My Tickets", "/tickets", "📋"),
                            nav("🎫 Create New Ticket", "/tickets/create", "🎫")
                    ))
                    .build();
        }

        // Comments
        if (matchesAny(msg, "comment", "add comment", "reply to ticket", "respond to ticket")) {
            return ChatResponse.builder()
                    .reply("💬 **Adding Comments to Tickets:**\n\n" +
                            "1. Go to your tickets and click on one\n" +
                            "2. Scroll to the comments section\n" +
                            "3. Type your comment and submit\n\n" +
                            "Both users and staff can communicate through comments.")
                    .category("comment")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("📋 View My Tickets", "/tickets", "📋"),
                            nav("🎫 Create New Ticket", "/tickets/create", "🎫")
                    ))
                    .build();
        }

        // Notifications
        if (matchesAny(msg, "notification", "alert", "unread", "bell", "notify")) {
            return ChatResponse.builder()
                    .reply("🔔 **Notifications:**\n\n" +
                            "You receive notifications for:\n" +
                            "• Booking approvals/rejections\n" +
                            "• Ticket status updates\n" +
                            "• New comments on your tickets\n\n" +
                            "Click below to view all your notifications!")
                    .category("notification")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("🔔 View Notifications", "/notifications", "🔔"),
                            nav("📅 My Bookings", "/bookings", "📅"),
                            nav("🎫 My Tickets", "/tickets", "🎫")
                    ))
                    .build();
        }

        // Admin features
        if (matchesAny(msg, "admin", "manage", "admin panel", "admin feature", "manage user", "user management", "roles")) {
            return ChatResponse.builder()
                    .reply("👑 **Admin Quick Actions:**\n\n" +
                            "As an admin, you can manage the entire campus operations. Use the buttons below for quick access:")
                    .category("admin")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("📅 Manage Bookings", "/bookings/manage", "📅"),
                            nav("🎫 Manage Tickets", "/tickets/manage", "🎫"),
                            nav("👥 Manage Users", "/admin/users", "👥"),
                            nav("➕ Add Resource", "/resources/create", "➕"),
                            nav("📋 View Resources", "/resources", "📋")
                    ))
                    .build();
        }

        // Create resource (admin)
        if (matchesAny(msg, "create resource", "add resource", "new resource", "register resource")) {
            return ChatResponse.builder()
                    .reply("➕ **Create a New Resource (Admin only):**\n\n" +
                            "Click the button below to go directly to the resource creation form!")
                    .category("admin")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("➕ Create Resource", "/resources/create", "➕"),
                            nav("📋 View Resources", "/resources", "📋")
                    ))
                    .build();
        }

        // Login / Authentication
        if (matchesAny(msg, "login", "sign in", "log in", "authentication", "password", "account", "register", "sign up", "google login", "oauth")) {
            return ChatResponse.builder()
                    .reply("🔐 **Authentication:**\n\n" +
                            "You're currently logged in! You can access:\n\n" +
                            "• Your Dashboard\n" +
                            "• Resources & Bookings\n" +
                            "• Support Tickets\n" +
                            "• Notifications")
                    .category("auth")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("🏠 Go to Dashboard", "/", "🏠"),
                            nav("📋 Browse Resources", "/resources", "📋")
                    ))
                    .build();
        }

        // Dashboard
        if (matchesAny(msg, "dashboard", "home", "overview", "main page")) {
            return ChatResponse.builder()
                    .reply("🏠 **Dashboard** shows your campus overview:\n\n" +
                            "• Resource count, bookings, tickets & notifications\n" +
                            "• Recent activity\n\n" +
                            "Click below to go there or take other actions!")
                    .category("dashboard")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("🏠 Go to Dashboard", "/", "🏠"),
                            nav("📋 Browse Resources", "/resources", "📋"),
                            nav("📅 My Bookings", "/bookings", "📅"),
                            nav("🎫 My Tickets", "/tickets", "🎫")
                    ))
                    .build();
        }

        // Help / what can you do
        if (matchesAny(msg, "help", "what can you do", "capabilities", "features", "options", "menu", "commands")) {
            return ChatResponse.builder()
                    .reply("🤖 **I'm your campus assistant! Here's what I can do:**\n\n" +
                            "� **Book resources** right in this chat!\n" +
                            "🎫 **Raise tickets** step by step through chat!\n" +
                            "📋 **Show resources** & navigate to any page\n" +
                            "🔔 **Check notifications** — stay updated\n" +
                            "👑 **Admin tools** — manage everything\n\n" +
                            "Click any button below to take action right away!")
                    .category("help")
                    .suggestions(List.of())
                    .actions(List.of(
                            flow("📅 Book a Resource", "booking", "📅"),
                            flow("🎫 Raise a Ticket", "ticket", "🎫"),
                            nav("📋 Browse Resources", "/resources", "📋"),
                            nav("📅 My Bookings", "/bookings", "📅"),
                            nav("🔔 Notifications", "/notifications", "🔔"),
                            nav("🏠 Dashboard", "/", "🏠")
                    ))
                    .build();
        }

        // Specific resource type queries
        if (matchesAny(msg, "lecture hall", "auditorium")) {
            return buildResourceTypeResponse(ResourceType.LECTURE_HALL, "Lecture Halls & Auditoriums");
        }
        if (matchesAny(msg, "lab", "laboratory")) {
            return buildResourceTypeResponse(ResourceType.LAB, "Labs & Laboratories");
        }
        if (matchesAny(msg, "meeting room", "seminar")) {
            return buildResourceTypeResponse(ResourceType.MEETING_ROOM, "Meeting Rooms");
        }
        if (matchesAny(msg, "projector")) {
            return buildResourceTypeResponse(ResourceType.PROJECTOR, "Projectors");
        }
        if (matchesAny(msg, "camera")) {
            return buildResourceTypeResponse(ResourceType.CAMERA, "Cameras");
        }
        if (matchesAny(msg, "equipment", "printer")) {
            return buildResourceTypeResponse(ResourceType.EQUIPMENT, "Equipment");
        }

        // Default — unrecognized
        return ChatResponse.builder()
                .reply("🤔 I'm not sure I understand that. Try one of the quick actions below, or ask me about resources, bookings, tickets, or admin features!")
                .category("unknown")
                .suggestions(List.of())
                .actions(List.of(
                        flow("📅 Book a Resource", "booking", "📅"),
                        flow("🎫 Raise a Ticket", "ticket", "🎫"),
                        nav("📋 Browse Resources", "/resources", "📋"),
                        nav("🏠 Dashboard", "/", "🏠"),
                        query("❓ What can you do?", "What can you do?", "❓")
                ))
                .build();
    }

    private ChatResponse buildResourceTypeResponse(ResourceType type, String label) {
        List<Resource> resources = resourceRepository.findByType(type);
        if (resources.isEmpty()) {
            return ChatResponse.builder()
                    .reply("📋 No **" + label + "** are currently listed. An admin can add them from the Resources page.")
                    .category("resources")
                    .suggestions(List.of())
                    .actions(List.of(
                            nav("➕ Add Resource (Admin)", "/resources/create", "➕"),
                            nav("📋 View All Resources", "/resources", "📋")
                    ))
                    .build();
        }

        StringBuilder sb = new StringBuilder("📋 **" + label + ":**\n\n");
        for (Resource r : resources) {
            sb.append("• **").append(r.getName()).append("**");
            if (r.getLocation() != null) sb.append(" — ").append(r.getLocation());
            if (r.getCapacity() > 0) sb.append(" (Capacity: ").append(r.getCapacity()).append(")");
            sb.append(" [").append(r.getStatus()).append("]\n");
        }
        sb.append("\nClick a button below to book one directly!");

        List<ActionButton> actions = new ArrayList<>();
        actions.add(nav("📋 View All Resources", "/resources", "📋"));
        for (Resource r : resources) {
            if (r.getId() != null) {
                actions.add(nav("📅 Book: " + r.getName(), "/bookings/create/" + r.getId(), "📅"));
            }
        }

        return ChatResponse.builder()
                .reply(sb.toString())
                .category("resources")
                .suggestions(List.of())
                .actions(actions)
                .build();
    }

    private boolean matchesAny(String input, String... keywords) {
        for (String keyword : keywords) {
            if (input.contains(keyword)) return true;
        }
        return false;
    }

    private String formatResourceType(ResourceType type) {
        return switch (type) {
            case LECTURE_HALL -> "Lecture Halls";
            case LAB -> "Labs";
            case MEETING_ROOM -> "Meeting Rooms";
            case PROJECTOR -> "Projectors";
            case CAMERA -> "Cameras";
            case EQUIPMENT -> "Equipment";
        };
    }
}
