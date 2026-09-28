"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Semester } from "@/lib/site/content/programs";

const ORDINAL = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth"];

/**
 * Semester-by-semester scheme of studies. Year tabs follow the WAI-ARIA tabs
 * pattern (arrow keys move between years); every panel is server-rendered
 * so the whole curriculum is in the document for search and for print.
 */
export function Curriculum({ semesters }: { semesters: Semester[] }) {
  const years = [...new Set(semesters.map((s) => s.year))];
  const tracks = [...new Set(semesters.map((s) => s.track).filter(Boolean))] as string[];
  const [year, setYear] = useState(years[0]);
  const [track, setTrack] = useState(tracks[0]);
  const [showAll, setShowAll] = useState(false);
  const base = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % years.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + years.length) % years.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = years.length - 1;
    else return;
    e.preventDefault();
    setYear(years[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" aria-label="Year of study" className={cn("-mb-px flex overflow-x-auto", showAll && "invisible")}>
          {years.map((y, i) => (
            <button
              key={y}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${y}`}
              aria-selected={year === y}
              aria-controls={`${base}-panel-${y}`}
              tabIndex={year === y ? 0 : -1}
              onClick={() => setYear(y)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "shrink-0 border-b-2 px-4 pb-3 text-[0.9375rem] font-medium whitespace-nowrap transition-colors sm:px-5",
                year === y ? "border-brass-500 text-forest-900" : "border-transparent text-ink-muted hover:text-forest-900",
              )}
            >
              Year {y}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={showAll}
          className="mb-3 self-start text-sm font-medium text-forest-800 underline underline-offset-4 sm:self-auto"
        >
          {showAll ? "Show one year at a time" : "Show all 8 semesters"}
        </button>
      </div>

      {years.map((y) => {
        const yearSemesters = semesters.filter((s) => s.year === y);
        const yearTracks = [...new Set(yearSemesters.map((s) => s.track).filter(Boolean))] as string[];
        const visible = yearTracks.length && !showAll ? yearSemesters.filter((s) => s.track === track) : yearSemesters;
        return (
          <div
            key={y}
            role={showAll ? undefined : "tabpanel"}
            id={`${base}-panel-${y}`}
            aria-labelledby={showAll ? undefined : `${base}-tab-${y}`}
            hidden={!showAll && year !== y}
            className="pt-8"
          >
            {showAll && <h3 className="font-display mb-4 text-2xl text-forest-900">Year {y}</h3>}
            {yearTracks.length > 0 && !showAll && (
              <fieldset className="mb-6 flex flex-wrap items-center gap-2">
                <legend className="mr-2 mb-2 text-sm text-ink-muted sm:float-left sm:mb-0">Major:</legend>
                {yearTracks.map((t) => (
                  <label
                    key={t}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass-500",
                      track === t ? "border-forest-800 bg-forest-800 text-sand-50" : "border-line bg-white text-forest-900 hover:border-forest-700",
                    )}
                  >
                    <input type="radio" name={`${base}-track`} value={t} checked={track === t} onChange={() => setTrack(t)} className="sr-only" />
                    {t.replace("Major in ", "")}
                  </label>
                ))}
              </fieldset>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
              {visible.map((s) => (
                <SemesterTable key={`${s.number}-${s.track ?? ""}`} semester={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SemesterTable({ semester }: { semester: Semester }) {
  return (
    <section className="border border-line bg-white" aria-label={`Semester ${semester.number}${semester.track ? `, ${semester.track}` : ""}`}>
      <header className="flex items-start justify-between gap-4 border-b border-line bg-sand-100 px-5 py-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{ORDINAL[semester.number]} semester</p>
          <h4 className="font-display mt-0.5 text-xl text-forest-900">
            Semester {semester.number}
            {semester.track && <span className="block text-sm font-sans text-ink-muted">{semester.track}</span>}
          </h4>
        </div>
        <p className="shrink-0 text-right">
          <span className="font-display block text-2xl leading-none text-forest-900">{semester.totalCreditHours}</span>
          <span className="text-xs text-ink-muted">credit hours</span>
        </p>
      </header>
      <table className="w-full text-left text-[0.9375rem]">
        <caption className="sr-only">
          Courses for semester {semester.number}
          {semester.track ? ` (${semester.track})` : ""}
        </caption>
        <thead>
          <tr className="text-xs tracking-[0.08em] text-ink-muted uppercase">
            <th scope="col" className="w-[5.5rem] py-2.5 pr-2 pl-4 font-medium sm:px-5">
              Code
            </th>
            <th scope="col" className="px-2 py-2.5 font-medium">
              Course title
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium whitespace-nowrap sm:px-5">
              Cr. Hrs
            </th>
          </tr>
        </thead>
        <tbody>
          {semester.courses.map((course, i) => (
            <CourseRows key={`${course.code}-${i}`} course={course} />
          ))}
        </tbody>
      </table>
      {semester.notes && (
        <div className="border-t border-line px-5 py-3 text-sm leading-relaxed text-ink-muted">
          {semester.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}
    </section>
  );
}

function CourseRows({ course }: { course: Semester["courses"][number] }) {
  return (
    <>
      <tr className="border-t border-line/70 align-top">
        <td className="py-3 pr-2 pl-4 font-mono text-[0.8125rem] whitespace-nowrap text-ink-muted sm:px-5">
          {course.code === "—" ? <span aria-label="Code not assigned">—</span> : course.code}
        </td>
        <td className="px-2 py-3 text-ink">{course.title}</td>
        <td className="px-4 py-3 text-right text-ink-muted tabular-nums sm:px-5">{course.credits}</td>
      </tr>
      {course.orNext && (
        <tr>
          <td />
          <td colSpan={2} className="px-2 py-1 text-xs font-semibold tracking-[0.18em] text-brass-700 uppercase">
            or
          </td>
        </tr>
      )}
    </>
  );
}
