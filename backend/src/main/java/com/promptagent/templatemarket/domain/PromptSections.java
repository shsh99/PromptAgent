package com.promptagent.templatemarket.domain;

public record PromptSections(
    String role,
    String objective,
    Input input,
    Constraints constraints,
    String outputFormat,
    QualityCriteria qualityCriteria
) {
    public PromptSections {
        role = required(role, "role");
        objective = required(objective, "objective");
        input = required(input, "input");
        constraints = required(constraints, "constraints");
        outputFormat = required(outputFormat, "outputFormat");
        qualityCriteria = required(qualityCriteria, "qualityCriteria");
    }

    public String toCopyablePrompt() {
        return """
            ## 역할
            %s

            ## 목적
            %s

            ## 배경과 입력 데이터
            %s

            ## 대상 사용자
            %s

            ## 제약 조건
            %s

            ## 정보 부족·불확실성 처리
            %s

            ## 출력 형식
            %s

            ## 품질 기준
            %s

            ## 최종 자체 점검
            %s""".formatted(role, objective, input.backgroundAndInput, input.targetAudience,
                constraints.rules, constraints.uncertaintyHandling, outputFormat,
                qualityCriteria.criteria, qualityCriteria.selfCheck);
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

    public record Input(String backgroundAndInput, String targetAudience) {
        public Input {
            backgroundAndInput = required(backgroundAndInput, "backgroundAndInput");
            targetAudience = required(targetAudience, "targetAudience");
        }
    }

    public record Constraints(String rules, String uncertaintyHandling) {
        public Constraints {
            rules = required(rules, "rules");
            uncertaintyHandling = required(uncertaintyHandling, "uncertaintyHandling");
        }
    }

    public record QualityCriteria(String criteria, String selfCheck) {
        public QualityCriteria {
            criteria = required(criteria, "criteria");
            selfCheck = required(selfCheck, "selfCheck");
        }
    }
}
