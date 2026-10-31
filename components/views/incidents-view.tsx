"use client"

import {
  CircleCheckIcon,
  HeartPulseIcon,
  HistoryIcon,
  PhoneCallIcon,
  SirenIcon,
  TimerIcon,
  TriangleAlertIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { StatusPill } from "@/components/dashboard/status-pill"
import { trendOf } from "@/components/dashboard/trend-badge"
import { UserAvatar, UserCell } from "@/components/dashboard/user-avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fmtDateTime, fmtInt, fmtMinutes, fmtMonth, fmtPct } from "@/lib/format"
import {
  SEVERITY_DESC,
  incidents,
  monthlyIncidentStats,
  mttrLastMonth,
  mttrThisMonth,
  onCall,
  openIncidents,
  serviceUptime,
  severityCounts90d,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

const SEV_CLASS: Record<IncidentSeverity, string> = {
  S1: "bg-status-critical text-white",
  S2: "bg-status-serious text-white",
  S3: "bg-status-warning text-black",
  S4: "bg-muted text-muted-foreground",
}

const STATUS_META: Record<IncidentStatus, { status: Status; label: string; icon: LucideIcon }> = {
  open: { status: "critical", label: "진행 중", icon: SirenIcon },
  mitigated: { status: "warning", label: "완화됨", icon: WrenchIcon },
  resolved: { status: "good", label: "해결", icon: CircleCheckIcon },
}

function uptimeStatus(u: number): Status {
  return u >= 99.9 ? "good" : u >= 99.5 ? "warning" : "critical"
}

export function IncidentsView() {
  const avgUptime = serviceUptime.reduce((s, u) => s + u.uptime, 0) / serviceUptime.length
  const s1 = openIncidents.some((i) => i.severity === "S1")

  return (
    <>
      <KpiGrid>
        <KpiTile
          label="진행 중 인시던트"
          value={fmtInt(openIncidents.length)}
          unit="건"
          hint={openIncidents.map((i) => `${i.id} (${i.severity})`).join(" · ") || "없음"}
          icon={SirenIcon}
          tone={s1 ? "rose" : openIncidents.length ? "amber" : "emerald"}
        />
        <KpiTile
          label="이번 달 MTTR"
          value={fmtMinutes(mttrThisMonth)}
          hint={`지난달 ${fmtMinutes(mttrLastMonth)}`}
          trend={trendOf(mttrThisMonth, mttrLastMonth, { invert: true, suffix: "분" })}
          icon={TimerIcon}
          tone="sky"
          spark={monthlyIncidentStats.map((m) => m.mttr)}
        />
        <KpiTile
          label="90일 인시던트"
          value={fmtInt(incidents.length)}
          unit="건"
          hint={severityCounts90d.map((s) => `${s.severity} ${s.count}`).join(" · ")}
          icon={HistoryIcon}
          tone="violet"
          spark={monthlyIncidentStats.map((m) => m.count)}
        />
        <KpiTile
          label="평균 가용성"
          value={fmtPct(avgUptime, 2)}
          hint="90일 · 8개 핵심 서비스"
          icon={HeartPulseIcon}
          tone={avgUptime >= 99.9 ? "emerald" : "amber"}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4  @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCallIcon className="size-4 text-tone-rose" />
              온콜
            </CardTitle>
            <CardDescription>{onCall.rotation}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-lg border bg-card/60 px-4 py-4">
              <UserAvatar name={onCall.primary.name} hue={onCall.primary.hue} size="lg" />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-xs font-bold text-tone-rose">1차 대응</div>
                <div className="truncate font-bold">{onCall.primary.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {onCall.primary.department} · {onCall.primary.title}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border bg-card/60 px-4 py-4">
              <UserAvatar name={onCall.secondary.name} hue={onCall.secondary.hue} size="md" />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-xs font-bold text-muted-foreground">2차 대응</div>
                <div className="truncate font-bold">{onCall.secondary.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {onCall.secondary.department} · {onCall.secondary.title}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {severityCounts90d.map((s) => (
                <div key={s.severity} className="rounded-lg border px-2 py-2 text-center leading-tight">
                  <span className={cn("inline-block rounded px-2 text-[0.875rem] font-bold", SEV_CLASS[s.severity])}>{s.severity}</span>
                  <div className="mt-2 text-lg font-bold">{s.count}</div>
                  <div className="text-[0.875rem] text-muted-foreground">{SEVERITY_DESC[s.severity]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>월별 평균 복구 시간</CardTitle>
            <CardDescription>평균 해결 시간 (분) · 최근 6개월</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeBarChart
              data={monthlyIncidentStats.map((m) => ({ month: m.month, mttr: m.mttr }))}
              xKey="month"
              series={[{ key: "mttr", label: "MTTR", color: "var(--chart-1)" }]}
              xFormatter={fmtMonth}
              valueFormatter={(v) => `${v}분`}
              highlightLast
              className="h-52"
            />
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {monthlyIncidentStats.map((m) => (
                <span key={m.month}>
                  {fmtMonth(m.month)} <b className="text-foreground">{m.count}건</b>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-1">
          <CardHeader>
            <CardTitle>서비스 가용성</CardTitle>
            <CardDescription>최근 90일 · 목표 99.9%</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {serviceUptime.map((s) => {
                const st = uptimeStatus(s.uptime)
                return (
                  <li key={s.service} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2">
                    <span className="truncate font-mono text-[13px] font-semibold">{s.service}</span>
                    <StatusPill status={st} label={fmtPct(s.uptime, 2)} icon={st === "good" ? CircleCheckIcon : TriangleAlertIcon} size="xs" className="w-20 justify-center" />
                    <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", st === "good" ? "bg-status-good" : st === "warning" ? "bg-status-warning" : "bg-status-critical")}
                        style={{ width: `${((s.uptime - 99) / 1) * 100}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 text-[0.875rem] text-muted-foreground">막대는 99.0% ~ 100% 구간을 확대해 표시합니다.</p>
          </CardContent>
        </Card>
      </div>

      <div className="">
        <Card>
          <CardHeader>
            <CardTitle>인시던트 타임라인</CardTitle>
            <CardDescription>최근 90일 · {incidents.length}건</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="min-w-72">인시던트</TableHead>
                    <TableHead>심각도</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden md:table-cell">서비스</TableHead>
                    <TableHead className="hidden lg:table-cell">시작</TableHead>
                    <TableHead className="hidden text-right md:table-cell">소요</TableHead>
                    <TableHead className="hidden xl:table-cell">담당</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((i) => {
                    const st = STATUS_META[i.status]
                    return (
                      <TableRow key={i.id} className={i.status === "open" ? "bg-rose-500/5" : undefined}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                            <span className="truncate font-medium">{i.title}</span>
                          </div>
                          <div className="mt-2 truncate text-xs text-muted-foreground">
                            영향: {i.impact}
                            {i.rootCause && <> · 원인: {i.rootCause}</>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn("inline-block rounded px-2 py-px text-[0.875rem] font-bold", SEV_CLASS[i.severity])} title={SEVERITY_DESC[i.severity]}>
                            {i.severity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={st.status} label={st.label} icon={st.icon} size="xs" />
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs md:table-cell">{i.service}</TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground whitespace-nowrap lg:table-cell">{fmtDateTime(i.startedAt)}</TableCell>
                        <TableCell className="hidden text-right tabular-nums md:table-cell">
                          {i.status === "resolved" ? fmtMinutes(i.durationMin) : <span className="font-bold text-rose-700 dark:text-rose-300">{fmtMinutes(i.durationMin)} 경과</span>}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <UserCell name={i.owner.name} hue={i.owner.hue} size="xs" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
