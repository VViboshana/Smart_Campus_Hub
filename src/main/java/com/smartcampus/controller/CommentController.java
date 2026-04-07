package com.smartcampus.controller;

import com.smartcampus.dto.request.CommentRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.Comment;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final AuthService authService;

    // POST - Add comment to ticket
    @PostMapping
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CommentRequest request) {
        User currentUser = authService.getCurrentUser();
        Comment comment = commentService.addComment(ticketId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", comment));
    }

    // GET - Get all comments for a ticket
    @GetMapping
    public ResponseEntity<ApiResponse<List<Comment>>> getTicketComments(@PathVariable String ticketId) {
        List<Comment> comments = commentService.getTicketComments(ticketId);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    // PUT - Update comment
    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Comment>> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequest request) {
        User currentUser = authService.getCurrentUser();
        Comment comment = commentService.updateComment(commentId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", comment));
    }

    // DELETE - Delete comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId) {
        User currentUser = authService.getCurrentUser();
        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }
}
