"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  value: string | null;
  onChange: (value: string) => void;
};

type Mode = "day" | "month" | "year";

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [mode, setMode] = React.useState<Mode>("day");

  const initialDate = React.useMemo(
    () => (value ? new Date(value) : new Date()),
    [value],
  );

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );

  const [viewDate, setViewDate] = React.useState<Date>(initialDate);

  // halaman tahun (range 12 tahun)
  const [yearPage, setYearPage] = React.useState<number>(() => {
    const y = initialDate.getFullYear();
    return y - (y % 12); // 2025 -> 2016..2027
  });

  // sync kalau value luar berubah
  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setViewDate(d);
        const y = d.getFullYear();
        setYearPage(y - (y % 12));
      }
    }
  }, [value]);

  const monthLabel = format(viewDate, "MMMM");
  const yearLabel = format(viewDate, "yyyy");

  const handleSelectDay = (d: Date) => {
    setSelectedDate(d);
    setViewDate(d);
    onChange(format(d, "yyyy-MM-dd"));
  };

  const handleSelectMonth = (monthIndex: number) => {
    const d = new Date(viewDate);
    d.setMonth(monthIndex);
    setViewDate(d);
    setMode("day");
  };

  const handleSelectYear = (year: number) => {
    const d = new Date(viewDate);
    d.setFullYear(year);
    setViewDate(d);
    setMode("month");
  };

  // build grid tanggal untuk mode "day"
  const buildDaysGrid = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstDay = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      date: Date;
      inCurrentMonth: boolean;
    }[] = [];

    // total 6 minggu x 7 hari = 42 cell
    for (let i = 0; i < 42; i++) {
      let day: number;
      let cellMonth = month;
      let cellYear = year;
      let inCurrentMonth = true;

      if (i < firstDay) {
        // dari bulan sebelumnya
        day = daysInPrevMonth - firstDay + 1 + i;
        cellMonth = month - 1;
        if (cellMonth < 0) {
          cellMonth = 11;
          cellYear = year - 1;
        }
        inCurrentMonth = false;
      } else if (i >= firstDay + daysInMonth) {
        // dari bulan berikutnya
        day = i - (firstDay + daysInMonth) + 1;
        cellMonth = month + 1;
        if (cellMonth > 11) {
          cellMonth = 0;
          cellYear = year + 1;
        }
        inCurrentMonth = false;
      } else {
        // dalam bulan ini
        day = i - firstDay + 1;
      }

      cells.push({
        date: new Date(cellYear, cellMonth, day),
        inCurrentMonth,
      });
    }

    return cells;
  }, [viewDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 text-sm",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "Pilih tanggal"}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[230px] rounded-2xl border border-zinc-200 bg-white shadow-md p-3"
      >
        {/* HEADER: mirip iOS, cuma satu baris */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {mode === "day" && (
              <>
                <button
                  type="button"
                  className="text-sm font-semibold text-zinc-900 hover:underline"
                  onClick={() => setMode("month")}
                >
                  {monthLabel}
                </button>
                <span className="mx-1 text-sm text-muted-foreground">•</span>
                <button
                  type="button"
                  className="text-sm font-medium text-zinc-700 hover:underline"
                  onClick={() => setMode("year")}
                >
                  {yearLabel}
                </button>
              </>
            )}

            {mode === "month" && (
              <button
                type="button"
                className="text-sm font-semibold text-zinc-900 hover:underline"
                onClick={() => setMode("day")}
              >
                {monthLabel} {yearLabel}
              </button>
            )}

            {mode === "year" && (
              <button
                type="button"
                className="text-sm font-semibold text-zinc-900 hover:underline"
                onClick={() => setMode("day")}
              >
                Pilih Tahun
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {mode === "day" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => {
                    const d = new Date(viewDate);
                    d.setMonth(d.getMonth() - 1);
                    setViewDate(d);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => {
                    const d = new Date(viewDate);
                    d.setMonth(d.getMonth() + 1);
                    setViewDate(d);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {mode === "month" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => {
                    const d = new Date(viewDate);
                    d.setFullYear(d.getFullYear() - 1);
                    setViewDate(d);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => {
                    const d = new Date(viewDate);
                    d.setFullYear(d.getFullYear() + 1);
                    setViewDate(d);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {mode === "year" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setYearPage((prev) => prev - 12)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setYearPage((prev) => prev + 12)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* BODY */}
        {mode === "day" && (
          <div className="space-y-1">
            {/* header hari */}
            <div className="grid grid-cols-7 text-[11px] text-center text-zinc-400">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* grid tanggal — mirip iOS */}
            <div className="grid grid-cols-7 gap-y-1 text-sm">
              {buildDaysGrid.map((cell) => {
                const day = cell.date.getDate();
                const isToday =
                  selectedDate && isSameDate(cell.date, selectedDate);
                const isMuted = !cell.inCurrentMonth;

                return (
                  <button
                    key={cell.date.toISOString()}
                    type="button"
                    onClick={() =>
                      cell.inCurrentMonth && handleSelectDay(cell.date)
                    }
                    className={cn(
                      "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[13px]",
                      isMuted && "text-zinc-300",
                      !isMuted && "text-zinc-900",
                      isToday &&
                        "bg-zinc-900 text-white",
                      !isToday &&
                        !isMuted &&
                        "hover:bg-zinc-200 active:bg-zinc-300",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === "month" && (
          <div className="mt-1 grid grid-cols-3 gap-2">
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((m, idx) => (
              <Button
                key={m}
                type="button"
                variant={viewDate.getMonth() === idx ? "default" : "outline"}
                className={cn(
                  "h-8 text-xs",
                  viewDate.getMonth() === idx &&
                    "bg-zinc-900 text-white hover:bg-zinc-900",
                )}
                onClick={() => handleSelectMonth(idx)}
              >
                {m}
              </Button>
            ))}
          </div>
        )}

        {mode === "year" && (
          <div className="mt-1 grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const year = yearPage + i;
              const isActive = viewDate.getFullYear() === year;
              return (
                <Button
                  key={year}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "h-8 text-xs",
                    isActive && "bg-zinc-900 text-white hover:bg-zinc-900",
                  )}
                  onClick={() => handleSelectYear(year)}
                >
                  {year}
                </Button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
