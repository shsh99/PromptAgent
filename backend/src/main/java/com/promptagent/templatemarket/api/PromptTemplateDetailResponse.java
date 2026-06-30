package com.promptagent.templatemarket.api;

import com.promptagent.templatemarket.domain.Difficulty;
import com.promptagent.templatemarket.domain.PromptCategory;
import com.promptagent.templatemarket.domain.PromptTemplate;
import com.promptagent.templatemarket.domain.VerificationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(requiredProperties = {"id", "version", "title", "summary", "category", "categoryLabel",
    "difficulty", "targetModels", "tags", "verificationStatus", "requiredSections", "copyablePrompt"})
public record PromptTemplateDetailResponse(
    String id,
    String version,
    String title,
    String summary,
    PromptCategory category,
    String categoryLabel,
    Difficulty difficulty,
    List<String> targetModels,
    List<String> tags,
    VerificationStatus verificationStatus,
    RequiredSectionsResponse requiredSections,
    String copyablePrompt
) {
    static PromptTemplateDetailResponse from(PromptTemplate template) {
        return new PromptTemplateDetailResponse(template.id(), template.version(), template.title(),
            template.summary(), template.category(), template.category().label(), template.difficulty(),
            template.targetModels(), template.tags(), template.verificationStatus(),
            RequiredSectionsResponse.from(template.requiredSections()), template.copyablePrompt());
    }
}
