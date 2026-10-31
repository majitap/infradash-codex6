"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleCheck,
  CircleHelp,
  Radio,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useOperations } from "@/components/admin/operations-provider";
import { useDashboard } from "./dashboard-provider";
import { useInfraStatus } from "@/hooks/use-infra-status";
import { overallState } from "@/lib/infra-status";
import { DataConnect } from "./data-connect";

export function CompactLicense() {
  const { license, configured } = useOperations();
  const { data, error, stale } = useDashboard();
  const liveLicense = license?.state === "available";
  const snapshotLicense = !error && !stale ? data?.license : null;
  const used = liveLicense
    ? license.activeUsers
    : configured
      ? null
      : snapshotLicense?.used;
  const total = liveLicense
    ? license.userLimit
    : configured
      ? null
      : snapshotLicense?.total;
  const demo = !configured && data?.source === "demo";
  return (
    <Link
      href="/admin/license"
      className="six-license"
      aria-label={`라이선스 ${used ?? "미확인"}/${total ?? "미확인"}${demo ? ", 예시" : ""}`}
    >
      <span>라이선스</span>
      <strong>
        {used ?? "—"}
        <i>/</i>
        {total ?? "—"}
      </strong>
      {demo && <small>예시</small>}
    </Link>
  );
}
export function CompactStatus() {
  const infra = useInfraStatus();
  const dashboard = useDashboard();
  const hasLive = dashboard.data?.source === "live";
  const failed = infra.configured
    ? !!infra.error || infra.stale
    : !!dashboard.error || dashboard.stale;
  const known = infra.configured ? !!infra.snapshot : hasLive;
  const state =
    failed || !known
      ? "unknown"
      : infra.snapshot
        ? overallState(infra.snapshot.checks)
        : (dashboard.data?.health ?? "unknown");
  const title = failed
    ? "연결 상태 확인 필요"
    : state === "healthy"
      ? "깃랩 연결 정상"
      : state === "down"
        ? "깃랩 연결 이상"
        : state === "degraded"
          ? "일부 서비스 점검 필요"
          : known
            ? "깃랩 상태 미확인"
            : "깃랩 연결 대기";
  const Icon =
    state === "healthy"
      ? CircleCheck
      : failed || state === "down" || state === "degraded"
        ? TriangleAlert
        : CircleHelp;
  return (
    <div className={`six-status-strip ${state}`} role="status">
      <div>
        <span className="six-status-icon">
          <Icon size={18} />
        </span>
        <strong>{title}</strong>
        <span className="six-status-description">
          {failed
            ? "최신 응답을 확인해 주세요."
            : known
              ? "전체 연결 상태"
              : "수집 주소를 연결하면 상태가 표시됩니다."}
        </span>
      </div>
      <div>
        {infra.configured ? (
          <button
            className="six-text-button"
            disabled={infra.loading}
            onClick={() => void infra.refresh()}
          >
            <RefreshCw size={14} />
            다시 확인
          </button>
        ) : (
          <DataConnect compact />
        )}
        <Link
          className="six-status-detail"
          href="/admin/integrations"
          aria-label="연동 설정 보기"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
export function SourceBadge() {
  const { data, source, stale, error } = useDashboard();
  return (
    <span
      className={`six-source-badge ${error || stale ? "stale" : data?.source === "live" ? "live" : ""}`}
    >
      <Radio size={13} />
      {error
        ? "연결 오류"
        : !data
          ? "데이터 대기"
          : data.source === "demo"
            ? "예시 데이터"
            : stale
              ? "이전 수집 데이터"
              : source === "file"
                ? "가져온 데이터"
                : "실제 데이터"}
    </span>
  );
}
