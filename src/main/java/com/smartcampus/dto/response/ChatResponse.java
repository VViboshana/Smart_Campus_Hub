package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String reply;
    private String category;
    private List<String> suggestions;
    private List<ActionButton> actions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionButton {
        private String label;
        private String type;  // "navigate", "query"
        private String value; // route path or query text
        private String icon;  // emoji icon
    }
}
