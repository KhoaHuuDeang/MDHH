"use client";

import React from "react";
import { getIcon } from "@/utils/getIcon";
import Link from "next/link";

/**
 * LandingMDHH.Refactor — Layout theo pattern bạn gửi (Studocu-like)
 * - Bạn đã có Header/Footer: chỉ cần render <LandingMDHH /> ở giữa
 * - Tailwind only, no custom keyframes; hover tương phản cao trên nền trắng
 * - Brand mix: blue cho trust/stats, green cho accent (theo DesignUI Convention)
 */

export default function LandingMDHH() {
  const [schoolTier, setSchoolTier] = React.useState<"university" | "highschool">("university");
  const [tab, setTab] = React.useState<"universities" | "documents" | "subjects">("universities");

  const chipData: Record<string, string[]> = {
    universities: [
      "Hanoi University of Science & Technology",
      "VNU-HCMUS",
      "Foreign Trade University",
      "HUTECH",
      "Phenikaa University",
      "University of Danang",
      "UEH",
      "PTIT",
      "UET - VNU",
      "NEU",
      "HCMUT",
      "Posts & Telecom Institute",
    ],
    documents: [
      "Calculus I Midterms",
      "Data Structures Cheat Sheet",
      "Physics Note Pack",
      "Discrete Math Bank",
      "Linear Algebra Slides",
      "OS Lab Report",
      "Database Exams",
      "IELTS Writing Band 7",
    ],
    subjects: [
      "Calculus",
      "Data Structures",
      "Discrete Mathematics",
      "Physics",
      "Operating Systems",
      "Databases",
      "English",
      "Probability",
    ],
  };

  return (
    <main className="bg-white text-gray-900">
      {/* ======================== HERO ======================== */}
      <section className="relative isolate overflow-hidden bg-[#2b0f1b] text-white">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -left-16 top-28 h-40 w-40 rounded-[36%] bg-[#9b34d7] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-[40%] bg-[#f97316] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute right-12 top-40 h-40 w-40 rounded-[40%] bg-[#10b981] opacity-50 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 md:pb-28 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Grow smarter together</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 md:text-base">
              Find top‑rated study notes from students taking the same courses as you.
            </p>

            {/* search */}
            <form className="mx-auto mt-6 max-w-2xl">
              <div className="relative flex items-stretch overflow-hidden rounded-full border border-white/20 bg-white/90 shadow-sm backdrop-blur">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{getIcon("Search", 18)}</span>
                <input
                  aria-label="Search for courses, quizzes, or documents"
                  placeholder="Search for courses, quizzes, or documents"
                  className="w-full rounded-full bg-transparent py-3 pl-10 pr-28 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Search
                </button>
              </div>
            </form>

            {/* down arrow */}
            <div className="mt-10 flex justify-center opacity-80">
              <a href="#stats" className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/30 transition hover:bg-white/10 hover:ring-white/60">
                {getIcon("ChevronDown", 18)}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== STATS ======================== */}
      <section id="stats" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold md:text-3xl">Over 1 billion students helped, and counting</h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">50K new study notes added every day, from the world’s most active student communities.</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 md:gap-8">
            {/* stat item */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#3b82f6]/40 hover:shadow-md">
              <div className="text-4xl font-extrabold tracking-tight">50M</div>
              <div className="mt-1 text-sm text-gray-700">Study resources</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#eff6ff] px-2 py-0.5 text-[11px] font-semibold text-[#2563eb] ring-1 ring-[#2563eb]/20">{getIcon("Zap", 12)} 1 new each second</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#10b981]/40 hover:shadow-md">
              <div className="text-4xl font-extrabold tracking-tight">120K</div>
              <div className="mt-1 text-sm text-gray-700">Institutions</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-green-600/20">{getIcon("Globe", 12)} In 100+ countries</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#f97316]/40 hover:shadow-md">
              <div className="text-4xl font-extrabold tracking-tight">60M</div>
              <div className="mt-1 text-sm text-gray-700">Users</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-600/20">{getIcon("Clock", 12)} Every month</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== DIRECTORY ======================== */}
      <section className="bg-[#f6f7fb]">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="text-center">
            <h3 className="text-2xl font-extrabold md:text-3xl">Only the best for the best</h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 md:text-base">Find the best study documents to ace your way through education.</p>
          </div>

          {/* tier switch */}
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center">
            <div className="relative inline-flex w-full rounded-full border border-gray-200 bg-white p-1 shadow-sm">
              <span
                className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full border transition-transform duration-300 ease-[cubic-bezier(.25,.8,.25,1)] ${
                  schoolTier === "university" ? "translate-x-1 bg-blue-50 border-blue-200" : "translate-x-[calc(100%+0.25rem)] bg-green-50 border-green-200"
                }`}
                aria-hidden
              />
              <button
                className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  schoolTier === "university" ? "text-[#2563eb]" : "text-gray-600 hover:text-[#2563eb]"
                }`}
                aria-pressed={schoolTier === "university"}
                onClick={() => setSchoolTier("university")}
              >
                University {getIcon("Building2", 14)}
              </button>
              <button
                className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  schoolTier === "highschool" ? "text-[#16a34a]" : "text-gray-600 hover:text-[#16a34a]"
                }`}
                aria-pressed={schoolTier === "highschool"}
                onClick={() => setSchoolTier("highschool")}
              >
                High School {getIcon("GraduationCap", 14)}
              </button>
            </div>
          </div>

          {/* directory card */}
          <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* tabs */}
            <div className="flex items-center justify-center gap-3">
              {["universities", "documents", "subjects"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t as any)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-all ${
                    tab === t
                      ? "bg-[#111827] text-white ring-transparent"
                      : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* chips */}
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(chipData[tab] ?? []).slice(0, 12).map((x) => (
                <Link
                  href="#"
                  key={x}
                  className="inline-flex items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 transition-all hover:border-[#3b82f6]/40 hover:bg-[#f8fbff]"
                >
                  <span className="truncate">{x}</span>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600">{getIcon("ChevronRight", 14)}</span>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-all hover:bg-gray-50">
                View all {tab}
                {getIcon("ArrowRight", 14)}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CULTURE / CTA ======================== */}
      <section className="bg-[#2f5955] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center md:py-20">
          <h3 className="text-2xl font-extrabold md:text-3xl">We work hard & We study smart!</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-white/80 md:text-base">
            Want to know more about our community culture, values and opportunities?
          </p>
          <div className="mt-5 flex items-center justify-center">
            <Link
              href="/careers"
              className="rounded-full bg-[#a3e635] px-5 py-2.5 text-sm font-semibold text-[#1f2937] shadow-sm transition-all hover:shadow-md hover:brightness-110"
            >
              Check our openings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
