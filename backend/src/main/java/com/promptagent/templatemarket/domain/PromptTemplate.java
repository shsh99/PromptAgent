package com.promptagent.templatemarket.domain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

public record PromptTemplate(
    String id,
    String version,
    String title,
    String summary,
    PromptCategory category,
    Difficulty difficulty,
    List<String> targetModels,
    List<String> tags,
    LifecycleStatus lifecycleStatus,
    VerificationStatus verificationStatus,
    PromptSections requiredSections
) {
    public PromptTemplate {
        id = required(id, "id");
        if (!id.matches("[a-z0-9]+(?:-[a-z0-9]+)*")) {
            throw new IllegalArgumentException("id must be a URL-safe ASCII slug");
        }
        version = required(version, "version");
        if (id.equals(version)) {
            throw new IllegalArgumentException("id and version must be distinct");
        }
        title = required(title, "title");
        summary = required(summary, "summary");
        category = required(category, "category");
        difficulty = required(difficulty, "difficulty");
        lifecycleStatus = required(lifecycleStatus, "lifecycleStatus");
        verificationStatus = required(verificationStatus, "verificationStatus");
        requiredSections = required(requiredSections, "requiredSections");
        targetModels = nonBlankValues(targetModels, "targetModels", false);
        tags = nonBlankValues(tags, "tags", true);
    }

    public boolean isPublic() {
        return lifecycleStatus == LifecycleStatus.PUBLISHED
            && verificationStatus == VerificationStatus.VERIFIED;
    }

    public String copyablePrompt() {
        return requiredSections.toCopyablePrompt();
    }

    private static String required(String value, String name) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(name + " must not be blank");
        }
        return value.trim();
    }

    private static <T> T required(T value, String name) {
        if (value == null) {
            throw new IllegalArgumentException(name + " must not be null");
        }
        return value;
    }

    private static List<String> nonBlankValues(List<String> values, String name, boolean allowEmpty) {
        if (values == null) {
            throw new IllegalArgumentException(name + " must not be null");
        }
        var unique = new LinkedHashMap<String, String>();
        values.stream().filter(value -> value != null && !value.trim().isEmpty()).map(String::trim)
            .forEach(value -> unique.putIfAbsent(value.toLowerCase(Locale.ROOT), value));
        if (!allowEmpty && unique.isEmpty()) {
            throw new IllegalArgumentException(name + " must not be empty");
        }
        return List.copyOf(new ArrayList<>(unique.values()));
    }
}
