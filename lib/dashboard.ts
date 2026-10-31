import { z } from "zod";
import {
  dailyPipelines,
  recentPipelines,
  runnerCounts,
  runnerCapacity,
  runnerBusy,
  avgQueueSeconds,
} from "./mock-data";

const count = z.number().int().nonnegative().max(1_000_000_000);
const text = z.string().min(1).max(160);
export const dashboardSchema = z.object({
  schemaVersion: z.literal(1),
  source: z.enum(["live", "demo"]),
  collectedAt: z.string().datetime({ offset: true }),
  workspace: text,
  license: z.object({ used: count, total: count }).nullable(),
  health: z.enum(["healthy", "degraded", "down", "unknown"]),
  daily: z
    .array(
      z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine(
            (v) =>
              !Number.isNaN(Date.parse(v)) &&
              new Date(v).toISOString().slice(0, 10) === v,
          ),
        success: count,
        failed: count,
        canceled: count,
      }),
    )
    .min(1)
    .max(366)
    .refine(
      (rows) => rows.every((r, i) => !i || r.date > rows[i - 1].date),
      "날짜는 중복 없이 오름차순이어야 합니다.",
    ),
  runners: z.object({
    online: count,
    offline: count,
    paused: count,
    capacity: count.nullable(),
    busy: count.nullable(),
  }),
  queueSeconds: z.number().nonnegative().max(86400).nullable(),
  pipelines: z
    .array(
      z.object({
        id: count,
        project: text,
        ref: text,
        status: z.enum(["success", "failed", "running", "pending", "canceled"]),
        durationSeconds: z.number().nonnegative().nullable(),
        startedAt: z.string().datetime({ offset: true }).nullable(),
      }),
    )
    .max(1000),
  services: z
    .array(
      z.object({
        id: text,
        name: text,
        role: text,
        state: z.enum(["healthy", "degraded", "down", "unknown"]),
        detail: z.string().max(240),
      }),
    )
    .max(20)
    .refine((rows) => new Set(rows.map((r) => r.id)).size === rows.length),
  alerts: z
    .array(
      z.object({
        id: text,
        title: text,
        detail: z.string().max(240),
        severity: z.enum(["critical", "warning", "info"]),
      }),
    )
    .max(100),
});
export type DashboardSnapshot = z.infer<typeof dashboardSchema>;
export const demoDashboard: DashboardSnapshot = {
  schemaVersion: 1,
  source: "demo",
  collectedAt: "2026-10-31T01:12:00Z",
  workspace: "마지탭",
  license: { used: 952, total: 1000 },
  health: "unknown",
  daily: dailyPipelines,
  runners: { ...runnerCounts, capacity: runnerCapacity, busy: runnerBusy },
  queueSeconds: avgQueueSeconds,
  pipelines: recentPipelines.map(
    ({ id, project, ref, status, durationSeconds, startedAt }) => ({
      id,
      project,
      ref,
      status,
      durationSeconds,
      startedAt: `${startedAt}:00+09:00`,
    }),
  ),
  services: [
    {
      id: "edge",
      name: "엣지",
      role: "트래픽 진입",
      state: "healthy",
      detail: "웹 방화벽과 캐시 · 응답 12밀리초",
    },
    {
      id: "gitlab",
      name: "깃랩",
      role: "애플리케이션",
      state: "healthy",
      detail: "웹 서비스 · 응답 42밀리초 · 메모리 68%",
    },
    {
      id: "storage",
      name: "저장소",
      role: "코드 보관",
      state: "degraded",
      detail: "기탈리 볼륨 사용률 91% · 용량 확인 필요",
    },
    {
      id: "database",
      name: "데이터베이스",
      role: "데이터 관리",
      state: "healthy",
      detail: "복제본 3개 준비 · 응답 8밀리초",
    },
    {
      id: "runner",
      name: "러너",
      role: "작업 실행",
      state: "healthy",
      detail: "온라인 7대 · 동시 실행 용량 58개",
    },
  ],
  alerts: [
    {
      id: "incident",
      title: "결제 서비스 응답 오류",
      detail: "장애 대응 중 · 복구 진행 상황을 확인하세요.",
      severity: "critical",
    },
    {
      id: "storage",
      title: "저장소 여유 공간 9%",
      detail: "기탈리 볼륨의 용량 점검이 필요합니다.",
      severity: "warning",
    },
    {
      id: "cost",
      title: "사용하지 않는 자원 정리",
      detail: "월 2,840달러 절감 가능 · 예시 추정치",
      severity: "info",
    },
  ],
};

export function summarizeDashboard(snapshot: DashboardSnapshot, range: number) {
  const last = snapshot.daily.at(-1)!;
  const end = Date.parse(last.date);
  const days = snapshot.daily.filter(
    (d) => Date.parse(d.date) > end - range * 86400000,
  );
  const prior = snapshot.daily.filter(
    (d) =>
      Date.parse(d.date) <= end - range * 86400000 &&
      Date.parse(d.date) > end - range * 2 * 86400000,
  );
  const sum = (rows: typeof days, key: "success" | "failed" | "canceled") =>
    rows.reduce((n, d) => n + d[key], 0);
  const rateFor = (rows: typeof days) => {
    const s = sum(rows, "success"),
      f = sum(rows, "failed");
    return s + f ? (s / (s + f)) * 100 : null;
  };
  const rate = rateFor(days),
    previousRate = rateFor(prior);
  return {
    days,
    prior,
    rate,
    delta:
      rate === null ||
      previousRate === null ||
      prior.length !== range ||
      days.length !== range
        ? null
        : rate - previousRate,
    total: sum(days, "success") + sum(days, "failed") + sum(days, "canceled"),
    success: sum(days, "success"),
    failed: sum(days, "failed"),
  };
}
export function snapshotStale(snapshot: DashboardSnapshot, now = Date.now()) {
  return (
    snapshot.source === "live" &&
    (now - Date.parse(snapshot.collectedAt) > 120000 ||
      Date.parse(snapshot.collectedAt) > now + 30000)
  );
}
export function validateDataUrl(value: string) {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  )
    throw new Error("인증 정보가 없는 보안 연결 주소를 입력하세요.");
  return url.href;
}
