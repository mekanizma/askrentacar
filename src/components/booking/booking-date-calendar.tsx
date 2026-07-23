"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/utils/cn";
import type { VehicleBlockedPeriod, VehicleBusyPeriod } from "@/types";

type BookingDateCalendarProps = {
  blockedPeriods?: VehicleBlockedPeriod[];
  busyPeriods?: VehicleBusyPeriod[];
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  className?: string;
  showLegend?: boolean;
  showClear?: boolean;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayOverlapsPeriod(
  date: Date,
  start: string,
  end: string,
) {
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
  );
  const dayEnd = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
  );
  return dayStart < new Date(end) && dayEnd > new Date(start);
}

export function BookingDateCalendar({
  blockedPeriods = [],
  busyPeriods = [],
  rangeStart,
  rangeEnd,
  onChange,
  className,
  showLegend = true,
  showClear = true,
}: BookingDateCalendarProps) {
  const { locale, t } = useLocale();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [monthOffset, setMonthOffset] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const maxMonthOffset = 11;

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Date(2024, 0, 1 + index).toLocaleDateString(locale, {
          weekday: "short",
        }),
      ),
    [locale],
  );

  const calendarMonth = useMemo(() => {
    const monthDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset,
      1,
    );
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
    ).getDate();
    const mondayOffset = (monthDate.getDay() + 6) % 7;
    const cells: Array<number | null> = [
      ...Array.from({ length: mondayOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, day) => day + 1),
    ];
    return { monthDate, cells };
  }, [today, monthOffset]);

  const isDateUnavailable = useCallback(
    (date: Date) => {
      const blocked = blockedPeriods.some((period) =>
        dayOverlapsPeriod(date, period.start, period.end),
      );
      if (blocked) return true;
      return busyPeriods.some((period) =>
        dayOverlapsPeriod(date, period.start, period.end),
      );
    },
    [blockedPeriods, busyPeriods],
  );

  const isDatePast = useCallback((date: Date) => date < today, [today]);

  const isInSelectedRange = useCallback(
    (date: Date) => {
      if (!rangeStart) return false;
      if (!rangeEnd) return date.getTime() === rangeStart.getTime();
      return date >= rangeStart && date <= rangeEnd;
    },
    [rangeStart, rangeEnd],
  );

  const handleDateClick = useCallback(
    (date: Date) => {
      if (isDatePast(date) || isDateUnavailable(date)) return;
      if (!rangeStart || (rangeStart && rangeEnd)) {
        onChange(date, null);
        return;
      }
      if (date < rangeStart) {
        onChange(date, null);
        return;
      }
      if (date.getTime() === rangeStart.getTime()) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        onChange(date, next);
        return;
      }
      const cursor = new Date(rangeStart);
      while (cursor <= date) {
        if (isDateUnavailable(cursor)) {
          onChange(date, null);
          return;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      onChange(rangeStart, date);
    },
    [isDatePast, isDateUnavailable, rangeStart, rangeEnd, onChange],
  );

  return (
    <div className={cn(className)}>
      <p className="text-sm text-slate-400">
        {!rangeStart
          ? t("vehicle.selectStart")
          : !rangeEnd
            ? t("vehicle.selectEnd")
            : t("vehicle.selectDate")}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={monthOffset <= 0}
          aria-label={t("vehicle.prevMonth")}
          onClick={() => setMonthOffset((value) => Math.max(0, value - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm font-medium capitalize">
          {calendarMonth.monthDate.toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          })}
        </p>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={monthOffset >= maxMonthOffset}
          aria-label={t("vehicle.nextMonth")}
          onClick={() =>
            setMonthOffset((value) => Math.min(maxMonthOffset, value + 1))
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="mt-3 touch-pan-y"
        onTouchStart={(event) => {
          swipeStartX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const startX = swipeStartX.current;
          const endX = event.changedTouches[0]?.clientX;
          swipeStartX.current = null;
          if (startX == null || endX == null) return;
          const delta = endX - startX;
          if (Math.abs(delta) < 48) return;
          if (delta < 0) {
            setMonthOffset((value) => Math.min(maxMonthOffset, value + 1));
          } else {
            setMonthOffset((value) => Math.max(0, value - 1));
          }
        }}
      >
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 sm:gap-1.5 sm:text-xs">
          {weekdayLabels.map((label, index) => (
            <div key={`wd-${index}`} className="py-1.5 font-medium">
              {label}
            </div>
          ))}
          {calendarMonth.cells.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} />;
            const date = new Date(
              calendarMonth.monthDate.getFullYear(),
              calendarMonth.monthDate.getMonth(),
              day,
            );
            const past = isDatePast(date);
            const unavailable = isDateUnavailable(date);
            const selected = isInSelectedRange(date);
            const isStart =
              !!rangeStart && rangeStart.getTime() === date.getTime();
            const isEnd = !!rangeEnd && rangeEnd.getTime() === date.getTime();
            const disabled = past || unavailable;
            return (
              <button
                key={`${calendarMonth.monthDate.getFullYear()}-${calendarMonth.monthDate.getMonth()}-${day}`}
                type="button"
                disabled={disabled}
                title={
                  past
                    ? t("vehicle.pastDay")
                    : unavailable
                      ? t("vehicle.unavailable")
                      : t("vehicle.available")
                }
                onClick={() => handleDateClick(date)}
                className={cn(
                  "grid min-h-9 place-items-center rounded-lg text-xs font-medium transition focus-ring sm:min-h-10 sm:aspect-square",
                  disabled &&
                    "cursor-not-allowed bg-white/[0.03] text-slate-600",
                  unavailable &&
                    !past &&
                    "bg-rose-500/25 text-rose-200 line-through",
                  !disabled &&
                    !selected &&
                    "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 active:scale-95",
                  selected && "bg-gold/25 text-gold ring-1 ring-gold/40",
                  (isStart || isEnd) && "bg-gold text-slate-950 ring-0",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {showLegend && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            {t("vehicle.available")}
          </span>
          <span className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            {t("vehicle.unavailable")}
          </span>
          <span className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-gold" />
            {t("search.pickupDate")} / {t("search.returnDate")}
          </span>
        </div>
      )}

      {(rangeStart || rangeEnd) && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">
            {rangeStart?.toLocaleDateString(locale, {
              day: "numeric",
              month: "short",
            })}
            {rangeEnd
              ? ` → ${rangeEnd.toLocaleDateString(locale, {
                  day: "numeric",
                  month: "short",
                })}`
              : " → …"}
          </p>
          {showClear && (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => onChange(null, null)}
            >
              {t("vehicle.clearDates")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function dateToLocalInput(date: Date, time = "10:00") {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T${time}`;
}

export function localInputToDate(value: string): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
}

export function localInputTime(value: string, fallback = "10:00") {
  const match = value.match(/T(\d{2}:\d{2})/);
  return match?.[1] ?? fallback;
}
