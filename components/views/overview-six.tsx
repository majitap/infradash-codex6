"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  GitBranch,
  Layers3,
  RefreshCw,
  Server,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/components/overview/dashboard-provider";
import {
  CompactStatus,
  SourceBadge,
} from "@/components/overview/compact-status";
import { DataConnect } from "@/components/overview/data-connect";
import { ActivityChart } from "@/components/overview/activity-chart";
import { ServiceMap } from "@/components/overview/service-map";
import { pipelineStatus } from "@/components/overview/pipeline-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { summarizeDashboard, type DashboardSnapshot } from "@/lib/dashboard";
import { number, pipelineCsv, smoothPath } from "@/lib/overview-data";

type Pipeline = DashboardSnapshot["pipelines"][number];
function Spark({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <svg className="six-spark" viewBox="0 0 120 40" aria-hidden="true">
      <path
        d={smoothPath(
          values.map(
            (v, i) =>
              [
                (i * 120) / Math.max(1, values.length - 1),
                36 - (v / max) * 32,
              ] as const,
          ),
        )}
      />
    </svg>
  );
}
function duration(seconds: number | null) {
  return seconds === null
    ? "미수집"
    : seconds < 60
      ? `${Math.round(seconds)}초`
      : `${Math.floor(seconds / 60)}분 ${Math.round(seconds % 60)}초`;
}
export function OverviewView() {
  const dashboard = useDashboard(),
    { data, loading, source, stale, error } = dashboard;
  const [range, setRange] = useState<7 | 30>(7),
    [filter, setFilter] = useState("all"),
    [pipeline, setPipeline] = useState<Pipeline | null>(null),
    [alert, setAlert] = useState<DashboardSnapshot["alerts"][number] | null>(
      null,
    );
  const summary = data ? summarizeDashboard(data, range) : null;
  function exportReport() {
    if (!summary) return;
    const href = URL.createObjectURL(
      new Blob([pipelineCsv(summary.days)], {
        type: "text/csv;charset=utf-8;",
      }),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = `인프라대시-${data?.source === "demo" ? "예시-" : ""}${summary.days.at(-1)?.date}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    toast.success("조회 중인 실행 내역을 저장했습니다");
  }
  const runners = data?.runners,
    runnerTotal = runners
      ? runners.online + runners.offline + runners.paused
      : 0;
  const rows =
    data?.pipelines.filter((p) => filter === "all" || p.status === filter) ??
    [];
  const collected = data
    ? new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Seoul",
      }).format(new Date(data.collectedAt))
    : "아직 수집하지 않음";
  return (
    <div className="six-overview">
      <div className="six-intro">
        <div>
          <div className="six-intro-eyebrow">
            <span className="six-tiny-mark" />
            {data?.workspace ?? "우리 팀"}의 운영 공간
            <SourceBadge />
          </div>
          <h1>
            인프라의 오늘을, <span>선명하게.</span>
          </h1>
          <p>흐름을 읽고, 중요한 일에 집중하세요.</p>
        </div>
        <div className="six-intro-actions">
          <span className="six-collected">
            {collected}
            <span>
              {data?.source === "demo"
                ? "예시 스냅샷"
                : source === "file"
                  ? "파일 수집 시각 · 한국 시간"
                  : "최근 수집 · 한국 시간"}
            </span>
          </span>
          <button
            className="six-button"
            onClick={exportReport}
            disabled={!summary}
          >
            <ArrowDownToLine size={16} />
            리포트 내보내기
          </button>
        </div>
      </div>
      <CompactStatus />
      {(error || stale) && (
        <div className="six-data-notice" role="alert">
          <TriangleAlert size={18} />
          <span>
            {error ??
              "수집 후 2분 이상 지났습니다. 현재 표시된 값은 이전 수집 결과입니다."}
          </span>
          {source === "api" && (
            <button onClick={() => void dashboard.refresh()} disabled={loading}>
              다시 조회
            </button>
          )}
        </div>
      )}
      {!data || !summary ? (
        <div className="six-empty-dashboard">
          <Layers3 size={40} />
          <h2>
            {loading
              ? "운영 데이터를 불러오고 있습니다"
              : "아직 불러온 데이터가 없습니다"}
          </h2>
          <p>수집 주소와 응답 형식을 확인하거나 데이터 파일을 가져오세요.</p>
          <DataConnect />
        </div>
      ) : (
        <>
          <div className="six-overview-toolbar">
            <div>
              <h2>운영 한눈에 보기</h2>
              <span className="six-small-label">
                {summary.days.length}일 데이터
              </span>
            </div>
            <div className="six-toolbar-controls">
              <div className="six-segment" role="group" aria-label="조회 기간">
                {([7, 30] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setRange(n)}
                    aria-pressed={range === n}
                  >
                    최근 {n}일
                  </button>
                ))}
              </div>
              {source === "api" ? (
                <button
                  className="six-refresh"
                  aria-label="운영 데이터 새로고침"
                  onClick={() => void dashboard.refresh()}
                  disabled={loading}
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "is-refreshing" : ""}
                  />
                </button>
              ) : (
                <span className="six-static-label">
                  {source === "demo" ? "예시 미리보기" : "파일 기준"}
                </span>
              )}
            </div>
          </div>
          <div className="six-metrics">
            <article className="six-metric">
              <div className="six-metric-label">
                <span>
                  <CircleCheck size={16} />
                  파이프라인 성공률
                </span>
                <span className="six-metric-note">목표 95%</span>
              </div>
              <div className="six-metric-main">
                <strong>
                  {summary.rate === null ? "—" : summary.rate.toFixed(1)}
                  <small>%</small>
                </strong>
                <Spark
                  values={summary.days.map((d) =>
                    d.success + d.failed
                      ? (d.success / (d.success + d.failed)) * 100
                      : 0,
                  )}
                />
              </div>
              <div className="six-metric-description">
                <span className="six-positive">
                  {summary.delta === null
                    ? "비교 기간 부족"
                    : `${summary.delta >= 0 ? "+" : ""}${summary.delta.toFixed(1)}%p`}
                </span>
                <span>이전 기간 대비</span>
              </div>
            </article>
            <article className="six-metric">
              <div className="six-metric-label">
                <span>
                  <Layers3 size={16} />
                    완료된 파이프라인
                </span>
              </div>
              <div className="six-metric-main">
                <strong>
                  {number.format(summary.total)}
                  <small>회</small>
                </strong>
                <span className="six-mini-bars" aria-hidden="true">
                  {summary.days.slice(-10).map((d) => (
                    <i
                      key={d.date}
                      style={{
                        height: `${8 + (d.success / Math.max(1, ...summary.days.map((n) => n.success))) * 32}px`,
                      }}
                    />
                  ))}
                </span>
              </div>
              <div className="six-metric-description">
                성공 <b>{number.format(summary.success)}</b>
                <span className="six-divider-dot" />
                실패 <b>{number.format(summary.failed)}</b>
              </div>
            </article>
            <article className="six-metric">
              <div className="six-metric-label">
                <span>
                  <Server size={16} />
                  온라인 러너
                </span>
              </div>
              <div className="six-metric-main">
                <strong>
                  {runners!.online}
                  <small>/ {runnerTotal}대</small>
                </strong>
                <span className="six-runner-orbit" aria-hidden="true">
                  <Server size={20} />
                </span>
              </div>
              <div className="six-metric-description">
                <i className="six-dot green" />
                {runners!.capacity === null
                  ? "동시 실행 용량 미수집"
                  : `동시 작업 ${runners!.capacity}개 수용`}
              </div>
            </article>
            <article className="six-metric">
              <div className="six-metric-label">
                <span>
                  <Clock3 size={16} />
                  평균 대기 시간
                </span>
              </div>
              <div className="six-metric-main">
                <strong>
                  {data.queueSeconds === null
                    ? "—"
                    : number.format(data.queueSeconds)}
                  <small>초</small>
                </strong>
                <span className="six-queue-icon" aria-hidden="true">
                  <Clock3 size={24} />
                </span>
              </div>
              <div className="six-metric-description">
                {data.queueSeconds === null
                  ? "대기 시간 데이터 미수집"
                  : "작업 생성부터 러너 할당까지"}
              </div>
            </article>
          </div>
          <div className="six-primary-grid">
            <ActivityChart
              days={summary.days}
              prior={summary.prior}
              total={summary.total}
              delta={summary.delta}
            />
            <ServiceMap key={`${data.source}-${data.workspace}`} data={data} />
          </div>
          <div className="six-secondary-grid">
            <section className="six-panel six-pipelines">
              <div className="six-panel-heading">
                <div>
                  <span className="six-eyebrow">실행 기록</span>
                  <h2>
                    최근 파이프라인
                    <span className="six-count">{data.pipelines.length}</span>
                  </h2>
                </div>
                <Link className="six-text-link" href="/pipelines">
                  분석 예시
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              <div
                className="six-pipeline-filters"
                role="group"
                aria-label="파이프라인 상태 필터"
              >
                {[
                  { key: "all", label: "전체" },
                  { key: "running", label: "실행 중" },
                  { key: "failed", label: "실패" },
                ].map((f) => (
                  <button
                    key={f.key}
                    aria-pressed={filter === f.key}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                    <span>
                      {f.key === "all"
                        ? data.pipelines.length
                        : data.pipelines.filter((p) => p.status === f.key)
                            .length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="six-pipeline-columns" aria-hidden="true">
                <span>프로젝트 / 브랜치</span>
                <span>상태</span>
                <span>실행 시간</span>
              </div>
              <div className="six-pipeline-list">
                {rows.slice(0, 6).map((p) => {
                  const meta = pipelineStatus[p.status],
                    Icon = meta.icon;
                  return (
                    <button
                      key={`${p.project}-${p.id}`}
                      className="six-pipeline-row"
                      onClick={() => setPipeline(p)}
                      aria-label={`${p.project} ${meta.label} 상세 보기`}
                    >
                      <span className={`six-pipeline-icon ${p.status}`}>
                        <Icon size={18} />
                      </span>
                      <span className="six-project">
                        <strong>{p.project}</strong>
                        <span>
                          <GitBranch size={12} />
                          {p.ref}
                          <i />#{p.id}
                        </span>
                      </span>
                      <span className={`six-pipeline-status ${p.status}`}>
                        <i />
                        {meta.label}
                      </span>
                      <span className="six-duration">
                        {duration(p.durationSeconds)}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
                {!rows.length && (
                  <div className="six-empty-list">
                    <CircleCheck size={24} />
                    해당 상태의 파이프라인이 없습니다.
                  </div>
                )}
              </div>
              <div className="six-list-footer">
                <span>
                  {Math.min(rows.length, 6)} / {rows.length}건 표시
                </span>
                <button onClick={exportReport}>
                  일별 실행 내역 받기
                  <ArrowDownToLine size={14} />
                </button>
              </div>
            </section>
            <section className="six-panel six-attention">
              <div className="six-panel-heading">
                <div>
                  <span className="six-eyebrow">다음 할 일</span>
                  <h2>놓치지 말아야 할 것</h2>
                </div>
                <span className="six-attention-count">
                  {data.alerts.length}
                </span>
              </div>
              <div className="six-attention-items">
                {data.alerts.slice(0, 4).map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => setAlert(a)}
                    className={`six-attention-item ${a.severity}`}
                  >
                    <span className="six-attention-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="six-alert-label">
                        {a.severity === "critical"
                          ? "우선 확인"
                          : a.severity === "warning"
                            ? "점검 필요"
                            : "개선 제안"}
                      </span>
                      <strong>{a.title}</strong>
                      <span className="six-alert-description">{a.detail}</span>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
                {!data.alerts.length && (
                  <div className="six-empty-list">
                    <ShieldCheck size={32} />
                    수집된 알림이 없습니다.
                  </div>
                )}
              </div>
              <div className="six-attention-footer">
                <span className="six-footer-symbol">
                  <Check size={16} />
                </span>
                <div>
                  <strong>좋은 운영은, 작은 확인에서.</strong>
                  <span>
                    {data.source === "demo"
                      ? "지금은 예시 데이터를 보고 있습니다."
                      : "수집된 항목을 기준으로 확인하세요."}
                  </span>
                </div>
              </div>
            </section>
          </div>
          <div className="six-bottom-callout">
            <span>
              <span className="six-bottom-logo">
                <Layers3 size={18} />
              </span>
              <strong>
                {data.source === "demo"
                  ? "이제, 우리 팀의 데이터로."
                  : "흐름을 이어가는 운영 공간."}
              </strong>
              <span>
                {data.source === "demo"
                  ? "수집한 파일이나 주소로 개요를 채워보세요."
                  : "데이터 연결과 수집 시각을 함께 확인하세요."}
              </span>
            </span>
            <DataConnect compact />
          </div>
        </>
      )}
      <Dialog
        open={!!pipeline}
        onOpenChange={(open) => !open && setPipeline(null)}
      >
        <DialogContent className="six-detail-dialog">
          <DialogHeader>
            <DialogTitle>파이프라인 #{pipeline?.id}</DialogTitle>
            <DialogDescription>{pipeline?.project}</DialogDescription>
          </DialogHeader>
          {pipeline && (
            <dl className="six-detail-list">
              <div>
                <dt>상태</dt>
                <dd>{pipelineStatus[pipeline.status].label}</dd>
              </div>
              <div>
                <dt>브랜치</dt>
                <dd>{pipeline.ref}</dd>
              </div>
              <div>
                <dt>실행 시간</dt>
                <dd>{duration(pipeline.durationSeconds)}</dd>
              </div>
              <div>
                <dt>시작 시각</dt>
                <dd>
                  {pipeline.startedAt
                    ? new Intl.DateTimeFormat("ko-KR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Seoul",
                      }).format(new Date(pipeline.startedAt))
                    : "미수집"}
                </dd>
              </div>
            </dl>
          )}
          <p className="six-detail-note">
            {data?.source === "demo"
              ? "예시 실행 내역입니다."
              : "수집 데이터의 실행 내역입니다. 작업별 로그는 별도 로그 연동을 사용하세요."}
          </p>
        </DialogContent>
      </Dialog>
      <Dialog open={!!alert} onOpenChange={(open) => !open && setAlert(null)}>
        <DialogContent className="six-detail-dialog">
          <DialogHeader>
            <DialogTitle>{alert?.title}</DialogTitle>
            <DialogDescription>
              {alert?.severity === "critical"
                ? "우선 확인이 필요한 항목입니다."
                : "운영 상태를 확인해 주세요."}
            </DialogDescription>
          </DialogHeader>
          <p>{alert?.detail}</p>
          {data?.source === "demo" && (
            <p className="six-detail-note">
              예시 알림입니다. 실제 장애 상태를 의미하지 않습니다.
            </p>
          )}
          <Link className="six-button" href="/admin/integrations">
            연동 설정으로 이동
            <ArrowRight size={16} />
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}
