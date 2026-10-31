"use client"

import * as React from "react"
import { AwardIcon } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { doraMetrics, doraServiceRankings } from "@/lib/mock-data"
import { doraTierLabel } from "@/lib/localization"

export function DoraView() {
  return (
    <div className="legacy-page flex w-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            배포 속도와 안정성
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            DORA 4대 핵심 지표로 살펴보는 소프트웨어 배포 성과
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 text-xs font-bold text-emerald-600">
          <AwardIcon className="size-4" />
          DORA 최상위 등급
        </span>
      </div>

      {/* 4 Core DORA Cards */}
      <div className="legacy-metrics grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {doraMetrics.map((item, idx) => (
          <div
            key={item.key}
            className={`rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[140px] transition-transform hover:-translate-y-0.5 ${
              idx === 0
                ? "bg-[#6155ed] text-white shadow-sm shadow-[#6155ed]/20"
                : "bg-white border border-slate-200/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${idx === 0 ? "text-white/90" : "text-slate-500"}`}>
                {item.title.split(" (")[0]}
              </span>
              <span className={`rounded-full px-2 py-2 text-[0.8125rem] font-bold ${
                idx === 0 ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}>
                {doraTierLabel(item.tier)}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold tracking-tight ${idx === 0 ? "text-white" : "text-slate-900"}`}>
                  {item.value}
                </span>
                <span className={`text-xs font-medium ${idx === 0 ? "text-white/80" : "text-slate-400"}`}>
                  {item.unit}
                </span>
                <span className={`ml-auto text-xs font-bold ${idx === 0 ? "text-white" : "text-emerald-500"}`}>
                  {item.delta}
                </span>
              </div>
              <p className={`mt-2 text-xs leading-relaxed ${idx === 0 ? "text-white/80" : "text-slate-400"}`}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Service-Level DORA Table */}
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">서비스별 배포 성과</h3>
          <p className="text-xs text-slate-400 mt-2">
            주요 마이크로서비스 및 파이프라인별 엔지니어링 속도 비교
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-xs font-bold text-slate-400">서비스 리포지토리</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">담당 팀</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">배포 빈도 (DF)</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">변경 리드 타임 (LT)</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">변경 실패율 (CFR)</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">평균 복구 시간</TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-400">배포 성과 등급</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doraServiceRankings.map((svc) => (
                <TableRow key={svc.name} className="border-slate-100 hover:bg-slate-50/60">
                  <TableCell className="font-mono font-bold text-xs text-slate-900">{svc.name}</TableCell>
                  <TableCell className="text-xs text-slate-500">{svc.team}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-700">{svc.df}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-700">{svc.lt}</TableCell>
                  <TableCell className="font-mono text-xs text-emerald-600 font-semibold">{svc.cfr}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-700">{svc.mttr}</TableCell>
                  <TableCell className="text-right">
                    <span className="rounded-full bg-[#6155ed]/10 text-[#6155ed] px-4 py-2 text-[0.875rem] font-bold">
                      {doraTierLabel(svc.tier)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
