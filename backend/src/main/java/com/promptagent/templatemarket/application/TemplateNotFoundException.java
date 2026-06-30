package com.promptagent.templatemarket.application;

public final class TemplateNotFoundException extends RuntimeException {
    public TemplateNotFoundException() {
        super("요청한 공개 프롬프트 템플릿이 존재하지 않습니다.");
    }
}
