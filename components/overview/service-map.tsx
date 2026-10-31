"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Cloud,
  Database,
  GitBranch,
  HardDrive,
  Network,
  Server,
} from "lucide-react";
import type { DashboardSnapshot } from "@/lib/dashboard";
const stateNames = {
  healthy: "정상",
  degraded: "주의",
  down: "이상",
  unknown: "미확인",
};
const icons = [Cloud, GitBranch, HardDrive, Database, Server];
export function ServiceMap({ data }: { data: DashboardSnapshot }) {
  const [selected, setSelected] = useState<string | null>(null);
  const services = data.services.slice(0, 5);
  const node =
    services.find((n) => n.id === selected) ?? services[1] ?? services[0];
  return (
    <section className="six-service-panel">
      <div className="six-panel-heading">
        <div>
          <span className="six-eyebrow">연결된 인프라</span>
          <h2>작은 연결, 하나의 흐름</h2>
        </div>
        <Link href="/topology" aria-label="인프라 구성도 예시 보기">
          <ArrowUpRight size={20} />
        </Link>
      </div>
      <div className="six-service-caption">
        <span>
          <i />
          {services.length}개 구성 요소
        </span>
        <span>
          {data.source === "demo" ? "예시 구성도" : "수집된 구성 요소"}
        </span>
      </div>
      {services.length ? (
        <>
          <div
            className="six-service-map"
            role="group"
            aria-label="구성 요소 상태 선택"
          >
            {data.source === "demo" && (
              <svg
                viewBox="0 0 400 224"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M200 44V98M200 126V152H64V180M200 152V180M200 152H336V180" />
                <path
                  className="six-map-signal"
                  d="M200 44V98M200 126V152H64V180M200 152V180M200 152H336V180"
                />
              </svg>
            )}
            {services.map((n, i) => {
              const Icon = icons[i];
              return (
                <button
                  key={n.id}
                  className={`six-map-node map-position-${i} ${n.state}`}
                  aria-pressed={node?.id === n.id}
                  onClick={() => setSelected(n.id)}
                  aria-label={`${n.name}, ${stateNames[n.state]}`}
                >
                  <Icon size={19} />
                  <span>{n.name}</span>
                  <i />
                </button>
              );
            })}
          </div>
          <div className="six-node-detail" aria-live="polite">
            <div>
              <span className={`six-node-state ${node.state}`}>
                {stateNames[node.state]}
              </span>
              <strong>{node.name}</strong>
              <span>{node.role}</span>
            </div>
            <p>{node.detail || "상세 수집 정보가 없습니다."}</p>
          </div>
        </>
      ) : (
        <div className="six-map-empty">
          <Network size={32} />
          <p>수집된 구성 요소가 없습니다.</p>
        </div>
      )}
      <Link href="/topology" className="six-map-footer">
        인프라 구성도 살펴보기
        <span>
          예시
          <ArrowUpRight size={16} />
        </span>
      </Link>
    </section>
  );
}
