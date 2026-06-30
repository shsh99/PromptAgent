package com.promptagent.templatemarket.application;

import com.promptagent.templatemarket.domain.Difficulty;
import com.promptagent.templatemarket.domain.PromptCategory;

public record TemplateQuery(
    PromptCategory category,
    String query,
    Difficulty difficulty,
    int page,
    int size
) {
    public TemplateQuery {
        if (page < 0) {
            throw new IllegalArgumentException("page must be at least 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size must be between 1 and 100");
        }
        if (query != null && query.trim().length() > 100) {
            throw new IllegalArgumentException("query must not exceed 100 characters");
        }
    }
}
