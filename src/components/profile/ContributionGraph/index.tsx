"use client";

import { useState } from "react";
import type {
  ContributionDay,
  ContributionYear,
} from "@/src/types/contributions";
import { computeMonthLabels, trailingAverage } from "@/src/lib/utils";
import { ContributionCell } from "./Cell";
import { ContributionTooltip } from "./Tooltip";
import { ContributionLegend } from "./Legend";

export interface ContributionGraphProps {
  data: ContributionYear;
  onDayClick: (day: ContributionDay) => void;
  highlightedDates?: ReadonlySet<string>;
}

type TooltipState = {
  day: ContributionDay;
  x: number;
  y: number;
  trailingAvg: number;
} | null;

// Day labels: only Mon, Wed, Fri are visible; others are invisible for spacing.
const DAY_LABELS: Array<{ label: string; visible: boolean }> = [
  { label: "Sun", visible: false },
  { label: "Mon", visible: true },
  { label: "Tue", visible: false },
  { label: "Wed", visible: true },
  { label: "Thu", visible: false },
  { label: "Fri", visible: true },
  { label: "Sat", visible: false },
];

export function ContributionGraph({
  data,
  onDayClick,
  highlightedDates,
}: ContributionGraphProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const numWeeks = Math.ceil(data.days.length / 7);
  const monthLabels = computeMonthLabels(data.days);
  const labelByWeek = new Map(monthLabels.map((m) => [m.weekIndex, m.label]));

  const handleMouseEnter = (day: ContributionDay, x: number, y: number) => {
    setTooltip({
      day,
      x,
      y,
      trailingAvg: trailingAverage(data.days, day.date, 90),
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div>
      {/* Wrapper: day-of-week labels + graph */}
      <div className="contrib-wrapper">
        {/* Day labels column */}
        <div className="contrib-days-col" aria-hidden="true">
          {DAY_LABELS.map(({ label, visible }) => (
            <span
              key={label}
              className={visible ? "text-fg-faint font-mono" : "invisible"}
            >
              {visible ? label : label}
            </span>
          ))}
        </div>

        {/* Month labels + grid */}
        <div>
          {/* Month labels row */}
          <div className="contrib-months" aria-hidden="true">
            {Array.from({ length: numWeeks }, (_, w) => (
              <span key={w} className="contrib-month-label">
                {labelByWeek.get(w) ?? ""}
              </span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div
            role="grid"
            aria-label={`Contribution graph — ${data.total} total contributions`}
          >
            <div className="contrib-grid">
              {data.days.map((day, i) => (
                <ContributionCell
                  key={day.date}
                  day={day}
                  colIndex={Math.floor(i / 7)}
                  isHighlighted={highlightedDates?.has(day.date) ?? false}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={onDayClick}
                />
              ))}
            </div>
          </div>

          {/* Fix 4: legend inside right column so right edges align */}
          <div className="flex justify-end mt-3">
            <ContributionLegend />
          </div>
        </div>
      </div>

      {/* Tooltip (position: fixed, outside any stacking contexts) */}
      <ContributionTooltip
        day={tooltip?.day ?? null}
        position={tooltip ? { x: tooltip.x, y: tooltip.y } : null}
        trailingAvg={tooltip?.trailingAvg ?? 0}
      />
    </div>
  );
}
