package com.smartcampus.service;

import com.smartcampus.dto.request.CommentRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Comment;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketService ticketService;
    private final NotificationService notificationService;

    public Comment addComment(String ticketId, CommentRequest request, User currentUser) {
        Ticket ticket = ticketService.getTicketById(ticketId);

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .authorId(currentUser.getId())
                .authorName(currentUser.getName())
                .content(request.getContent())
                .build();

        comment = Objects.requireNonNull(commentRepository.save(Objects.requireNonNull(comment, "comment must not be null")),
            "saved comment must not be null");

        // Notify ticket reporter if comment is by someone else
        if (!ticket.getReporterId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    Objects.requireNonNull(ticket.getReporterId(), "ticket reporter id must not be null"),
                    "New Comment on Ticket",
                    currentUser.getName() + " commented on your ticket: " + ticket.getTitle(),
                    Notification.NotificationType.TICKET_COMMENT,
                    ticket.getId()
            );
        }

        // Notify assigned technician if comment is by someone else
        if (ticket.getAssignedTechnicianId() != null
                && !ticket.getAssignedTechnicianId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    Objects.requireNonNull(ticket.getAssignedTechnicianId(), "assigned technician id must not be null"),
                    "New Comment on Ticket",
                    currentUser.getName() + " commented on ticket: " + ticket.getTitle(),
                    Notification.NotificationType.TICKET_COMMENT,
                    ticket.getId()
            );
        }

        return comment;
    }

    public Comment updateComment(String commentId, CommentRequest request, User currentUser) {
        Comment comment = getCommentById(commentId);
        if (!comment.getAuthorId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        return Objects.requireNonNull(commentRepository.save(Objects.requireNonNull(comment, "comment must not be null")),
            "saved comment must not be null");
    }

    public void deleteComment(String commentId, User currentUser) {
        Comment comment = getCommentById(commentId);
        boolean isOwner = comment.getAuthorId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.name().equals("ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        commentRepository.delete(Objects.requireNonNull(comment, "comment must not be null"));
    }

    public List<Comment> getTicketComments(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    public Comment getCommentById(String id) {
        return commentRepository.findById(Objects.requireNonNull(id, "comment id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
    }
}
