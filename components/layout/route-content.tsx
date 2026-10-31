"use client";

import { OperationsBanner } from "@/components/admin/operations-banner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavItem, normalizePath } from "@/lib/nav";

const ownHeadings = ["/", "/ai-ops", "/topology", "/dora", "/finops"];
export function RouteContent({ children }: { children: React.ReactNode }) {
  const path = normalizePath(usePathname());
  const page = findNavItem(path);
  return (
    <div className="route-content @container/main">
      <OperationsBanner />
      {path !== "/" && !path.startsWith("/admin") && path !== "/logs" && <div className="six-route-notice"><span>예시 분석 화면 · 실제 개요 데이터와 별도로 표시됩니다.</span><Link href="/">운영 현황으로 돌아가기</Link></div>}
      {!ownHeadings.includes(path) && (
        <div className="route-heading">
          <p className="eyebrow">깃랩 운영 공간</p>
          <h1>{page?.title}</h1>
          <p>{page?.description}</p>
        </div>
      )}
      {children}
      <footer className="site-footer">
        <span>
          <span className="footer-dot" /> 인프라대시
        </span>
        <span>
          수집 시각과 데이터 출처를 확인해 주세요.
        </span>
      </footer>
    </div>
  );
}
