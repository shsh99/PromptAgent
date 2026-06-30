package com.promptagent.templatemarket.application;

import com.promptagent.templatemarket.domain.PromptTemplate;
import java.util.List;

public record TemplatePage(
    List<PromptTemplate> items,
    int page,
    int size,
    long totalElements,
    int totalPages
) { }
