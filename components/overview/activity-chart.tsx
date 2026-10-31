"use client";
import { useId, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChartColumnIncreasing,
  ChartNoAxesCombined,
} from "lucide-react";
import { smoothPath, dayTotal, shortDate, number } from "@/lib/overview-data";
import type { PipelineDay } from "@/lib/mock-data";
export function ActivityChart({
  days,
  prior,
  total,
  delta,
}: {
  days: PipelineDay[];
  prior: PipelineDay[];
  total: number;
  delta: number | null;
}) {
  const [mode, setMode] = useState<"line" | "bar">("line"),
    [selected, setSelected] = useState<string | null>(null);
  const id = useId().replaceAll(":", "");
  const active = Math.max(
    0,
    days.findIndex((d) => d.date === selected),
  );
  const index =
    selected && days.some((d) => d.date === selected)
      ? active
      : days.length - 1;
  const selectedDay = days[index];
  const maximum =
    Math.max(1, ...days.map(dayTotal), ...prior.map(dayTotal)) * 1.18;
  const points = (rows: PipelineDay[]) =>
    rows.map(
      (d, i) =>
        [
          24 + (rows.length > 1 ? i / (rows.length - 1) : 0.5) * 672,
          184 - (dayTotal(d) / maximum) * 160,
        ] as const,
    );
  const currentPoints = points(days),
    path = smoothPath(currentPoints),
    point = currentPoints[index];
  return (
    <section className="six-activity-panel six-panel">
      <div className="six-panel-heading">
        <div>
          <span className="six-eyebrow">배포 흐름</span>
          <h2>파이프라인 실행 추이</h2>
        </div>
        <div
          className="six-chart-toggle"
          role="group"
          aria-label="차트 표시 방식"
        >
          <button
            aria-label="곡선 차트"
            aria-pressed={mode === "line"}
            onClick={() => setMode("line")}
          >
            <ChartNoAxesCombined size={16} />
          </button>
          <button
            aria-label="막대 차트"
            aria-pressed={mode === "bar"}
            onClick={() => setMode("bar")}
          >
            <ChartColumnIncreasing size={16} />
          </button>
        </div>
      </div>
      <div className="six-chart-total">
        <strong>{number.format(total)}</strong>
        <span>회 실행</span>
        {delta !== null && (
          <span className={`six-trend ${delta < 0 ? "negative" : ""}`}>
            {delta >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            {Math.abs(delta).toFixed(1)}%p<span>성공률 변화</span>
          </span>
        )}
      </div>
      <div className="six-chart-key">
        <span>
          <i />
          선택 기간
        </span>
        {mode === "line" && prior.length === days.length && (
          <span>
            <i className="prior" />
            이전 기간
          </span>
        )}
        {mode === "bar" && (
          <span>
            <i className="fail" />
            실패
          </span>
        )}
      </div>
      <div className="six-chart-plot">
        <div className="six-chart-scale" aria-hidden="true">
          <span>{Math.ceil(maximum)}</span>
          <span>{Math.ceil(maximum / 2)}</span>
          <span>0</span>
        </div>
        <div className="six-chart-graphic">
          <svg
            viewBox="0 0 720 208"
            preserveAspectRatio="none"
            role="img"
            aria-label="파이프라인 실행 추이. 날짜 버튼을 선택하면 수치를 확인할 수 있습니다."
          >
            <defs>
              <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#4388ff" stopOpacity=".22" />
                <stop offset="1" stopColor="#4388ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[24, 104, 184].map((y) => (
              <line
                key={y}
                x1="0"
                x2="720"
                y1={y}
                y2={y}
                className="six-chart-grid"
              />
            ))}
            {mode === "line" ? (
              <>
                {prior.length === days.length && (
                  <path
                    d={smoothPath(points(prior))}
                    className="six-prior-line"
                  />
                )}
                <path
                  d={`${path} L${currentPoints.at(-1)![0]} 184 L${currentPoints[0][0]} 184Z`}
                  fill={`url(#fill-${id})`}
                />
                <path d={path} className="six-chart-line" />
                <line
                  x1={point[0]}
                  x2={point[0]}
                  y1="16"
                  y2="184"
                  className="six-chart-guide"
                />
                <circle
                  cx={point[0]}
                  cy={point[1]}
                  r="8"
                  className="six-chart-halo"
                />
                <circle
                  cx={point[0]}
                  cy={point[1]}
                  r="4"
                  className="six-chart-point"
                />
              </>
            ) : (
              days.map((d, i) => {
                const width = Math.min(40, 560 / days.length),
                  x =
                    24 +
                    (i * 672) / days.length +
                    336 / days.length -
                    width / 2,
                  height = (dayTotal(d) / maximum) * 160;
                return (
                  <g key={d.date}>
                    <rect
                      x={x}
                      y={184 - height}
                      width={width}
                      height={height}
                      rx="4"
                      fill={index === i ? "#246bfd" : "#97baff"}
                    />
                    <rect
                      x={x}
                      y={184 - height}
                      width={width}
                      height={(d.failed / maximum) * 160}
                      rx="3"
                      fill="#e9a1a6"
                    />
                  </g>
                );
              })
            )}
          </svg>
          <div className="six-chart-hitareas">
            {days.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelected(d.date)}
                aria-pressed={selectedDay.date === d.date}
                aria-label={`${d.date}, ${dayTotal(d)}회 실행`}
                title={`${shortDate(d.date)} · ${dayTotal(d)}회`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="six-chart-dates">
        {days
          .filter(
            (_, i) =>
              days.length <= 7 ||
              i === 0 ||
              i === days.length - 1 ||
              i % 7 === 0,
          )
          .map((d) => (
            <span key={d.date}>{shortDate(d.date)}</span>
          ))}
      </div>
      <div className="six-chart-bottom" aria-live="polite">
        <span className="six-chart-selected">
          {shortDate(selectedDay.date)}
          <span>선택한 날짜</span>
        </span>
        <span>
          <i className="success" />
          성공<strong>{number.format(selectedDay.success)}</strong>
        </span>
        <span>
          <i className="failed" />
          실패<strong>{number.format(selectedDay.failed)}</strong>
        </span>
        <span className="six-chart-canceled">
          취소<strong>{number.format(selectedDay.canceled)}</strong>
        </span>
      </div>
    </section>
  );
}
