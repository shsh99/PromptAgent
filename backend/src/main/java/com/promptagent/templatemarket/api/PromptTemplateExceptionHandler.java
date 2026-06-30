package com.promptagent.templatemarket.api;

import com.promptagent.templatemarket.application.TemplateNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice(assignableTypes = PromptTemplateController.class)
public class PromptTemplateExceptionHandler {
    private static final String NOT_FOUND_MESSAGE = "요청한 공개 프롬프트 템플릿이 존재하지 않습니다.";
    private static final String VALIDATION_MESSAGE = "요청 파라미터가 올바르지 않습니다.";

    @ExceptionHandler(TemplateNotFoundException.class)
    ResponseEntity<ProblemDetailResponse> notFound(HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, "프롬프트 템플릿을 찾을 수 없습니다.", NOT_FOUND_MESSAGE,
            "TEMPLATE_NOT_FOUND", request);
    }

    @ExceptionHandler({ConstraintViolationException.class, MethodArgumentTypeMismatchException.class,
        IllegalArgumentException.class, MethodArgumentNotValidException.class})
    ResponseEntity<ProblemDetailResponse> validation(HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "요청을 처리할 수 없습니다.", VALIDATION_MESSAGE,
            "VALIDATION_FAILED", request);
    }

    private ResponseEntity<ProblemDetailResponse> response(
        HttpStatus status,
        String title,
        String detail,
        String code,
        HttpServletRequest request
    ) {
        var body = new ProblemDetailResponse("about:blank", title, status.value(), detail,
            request.getRequestURI(), code, detail, UUID.randomUUID().toString(), List.of());
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }
}
