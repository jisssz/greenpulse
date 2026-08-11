package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.entity.Notification;
import com.greenpulse.security.CustomUserDetails;
import com.greenpulse.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Notification> notifications = notificationService.getUserNotifications(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id,
                                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
