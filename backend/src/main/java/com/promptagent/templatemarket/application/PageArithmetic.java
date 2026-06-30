package com.promptagent.templatemarket.application;

final class PageArithmetic {
    private PageArithmetic() { }

    static Window calculate(int page, int size, int totalElements) {
        long from = Math.min((long) page * size, totalElements);
        long to = Math.min(from + (long) size, totalElements);
        long totalPages = totalElements == 0 ? 0 : (totalElements + (long) size - 1) / size;
        return new Window(Math.toIntExact(from), Math.toIntExact(to), Math.toIntExact(totalPages));
    }

    record Window(int fromIndex, int toIndex, int totalPages) { }
}
