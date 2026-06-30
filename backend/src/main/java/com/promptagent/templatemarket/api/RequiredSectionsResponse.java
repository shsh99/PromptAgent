package com.promptagent.templatemarket.api;

import com.promptagent.templatemarket.domain.PromptSections;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(requiredProperties = {"role", "objective", "input", "constraints", "outputFormat", "qualityCriteria"})
public record RequiredSectionsResponse(
    String role,
    String objective,
    InputResponse input,
    ConstraintsResponse constraints,
    String outputFormat,
    QualityCriteriaResponse qualityCriteria
) {
    static RequiredSectionsResponse from(PromptSections sections) {
        return new RequiredSectionsResponse(sections.role(), sections.objective(),
            new InputResponse(sections.input().backgroundAndInput(), sections.input().targetAudience()),
            new ConstraintsResponse(sections.constraints().rules(), sections.constraints().uncertaintyHandling()),
            sections.outputFormat(), new QualityCriteriaResponse(sections.qualityCriteria().criteria(),
                sections.qualityCriteria().selfCheck()));
    }

    @Schema(requiredProperties = {"backgroundAndInput", "targetAudience"})
    public record InputResponse(String backgroundAndInput, String targetAudience) { }

    @Schema(requiredProperties = {"rules", "uncertaintyHandling"})
    public record ConstraintsResponse(String rules, String uncertaintyHandling) { }

    @Schema(requiredProperties = {"criteria", "selfCheck"})
    public record QualityCriteriaResponse(String criteria, String selfCheck) { }
}
