/**
 * 시안(910x1024) 좌표를 그대로 코드에 적기 위한 헬퍼.
 * du(28) 은 "시안에서 28px" 이라는 뜻이고, 화면 폭에 따라 --u 가 알아서 줄어듭니다.
 */
export const du = (designPx: number) => `calc(${designPx} * var(--u))`;
