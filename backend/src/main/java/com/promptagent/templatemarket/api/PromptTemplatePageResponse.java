package com.promptagent.templatemarket.api;

import com.promptagent.templatemarket.application.TemplatePage;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(requiredProperties = {"items", "page", "size", "totalElements", "totalPages"})
public record PromptTemplatePageResponse(
    List<PromptTemplateListItemResponse> items,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    static PromptTemplatePageResponse from(TemplatePage page) {
        return new PromptTemplatePageResponse(page.items().stream()
            .map(PromptTemplateListItemResponse::from).toList(), page.page(), page.size(),
            page.totalElements(), page.totalPages());
    }
}
