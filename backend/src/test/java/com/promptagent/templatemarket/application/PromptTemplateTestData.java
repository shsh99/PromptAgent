package com.promptagent.templatemarket.application;

import com.promptagent.templatemarket.domain.PromptSections;

final class PromptTemplateTestData {
    private PromptTemplateTestData() { }

    static PromptSections sections() {
        return new PromptSections("역할", "목적", new PromptSections.Input("배경", "대상"),
            new PromptSections.Constraints("규칙", "불확실성"), "출력",
            new PromptSections.QualityCriteria("품질", "점검"));
    }
}
