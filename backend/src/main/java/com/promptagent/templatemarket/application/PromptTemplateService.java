package com.promptagent.templatemarket.application;

import com.promptagent.templatemarket.domain.PromptTemplate;
import java.text.Normalizer;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class PromptTemplateService {
    private static final Comparator<PromptTemplate> STABLE_ORDER = Comparator
        .comparing(PromptTemplate::category)
        .thenComparing(PromptTemplate::title)
        .thenComparing(PromptTemplate::id);

    private final PromptTemplateRepository repository;

    public PromptTemplateService(PromptTemplateRepository repository) {
        this.repository = repository;
    }

    public TemplatePage findAll(TemplateQuery query) {
        List<String> tokens = tokens(query.query());
        List<PromptTemplate> filtered = repository.findAll().stream()
            .filter(PromptTemplate::isPublic)
            .filter(template -> query.category() == null || template.category() == query.category())
            .filter(template -> query.difficulty() == null || template.difficulty() == query.difficulty())
            .filter(template -> matches(template, tokens))
            .sorted(STABLE_ORDER)
            .toList();
        PageArithmetic.Window window = PageArithmetic.calculate(query.page(), query.size(), filtered.size());
        return new TemplatePage(filtered.subList(window.fromIndex(), window.toIndex()), query.page(), query.size(),
            filtered.size(), window.totalPages());
    }

    public PromptTemplate findById(String id) {
        return repository.findById(id).filter(PromptTemplate::isPublic)
            .orElseThrow(TemplateNotFoundException::new);
    }

    private boolean matches(PromptTemplate template, List<String> tokens) {
        if (tokens.isEmpty()) {
            return true;
        }
        String searchable = normalize(String.join(" ", template.title(), template.summary(),
            template.category().label(), String.join(" ", template.tags())));
        return tokens.stream().allMatch(searchable::contains);
    }

    private List<String> tokens(String query) {
        String normalized = normalize(query);
        return normalized.isEmpty() ? List.of() : Arrays.asList(normalized.split(" "));
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFKC).trim().replaceAll("\\s+", " ")
            .toLowerCase(Locale.ROOT);
    }
}
