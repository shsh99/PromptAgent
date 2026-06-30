package com.promptagent.templatemarket.application;

import com.promptagent.templatemarket.domain.PromptTemplate;
import java.util.List;
import java.util.Optional;

public interface PromptTemplateRepository {
    List<PromptTemplate> findAll();
    Optional<PromptTemplate> findById(String id);
}
