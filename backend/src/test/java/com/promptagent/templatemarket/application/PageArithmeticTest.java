package com.promptagent.templatemarket.application;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PageArithmeticTest {

    @Test
    void 최대_int_페이지의_곱셈과_끝_인덱스를_오버플로_없이_계산한다() {
        PageArithmetic.Window window = PageArithmetic.calculate(Integer.MAX_VALUE, 100, Integer.MAX_VALUE);

        assertThat(window.fromIndex()).isEqualTo(Integer.MAX_VALUE);
        assertThat(window.toIndex()).isEqualTo(Integer.MAX_VALUE);
        assertThat(window.totalPages()).isEqualTo(21_474_837);
    }

    @Test
    void 전체_원소가_없으면_전체_페이지도_0이다() {
        assertThat(PageArithmetic.calculate(0, 20, 0).totalPages()).isZero();
    }
}
