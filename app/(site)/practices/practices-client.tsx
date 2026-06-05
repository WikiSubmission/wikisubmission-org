"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Landmark,
  MapPin,
  Moon,
  Sparkles,
  Wallet,
} from "lucide-react";

import { FadeUp } from "@/lib/motion";
import PrayerTimesClient from "./prayer-times-client";
import RamadanClient from "./ramadan-client";
import { ZakatCalculator } from "@/components/zakat-calculator";
import type { components } from "@/src/api/types.gen";
import { F } from "../_sections/shared";

type VerseData = components["schemas"]["VerseData"];

// ── UTILS ─────────────────────────────────────────────────────────────

function gregorianToHijri(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate();
  const JD =
    Math.floor((1461 * (Y + 4800 + Math.floor((M - 14) / 12))) / 4) +
    Math.floor((367 * (M - 2 - 12 * Math.floor((M - 14) / 12))) / 12) -
    Math.floor(
      (3 * Math.floor((Y + 4900 + Math.floor((M - 14) / 12)) / 100)) / 4,
    ) +
    D -
    32075;
  const Z = JD - 1948438 + 10632;
  const N = Math.floor(Z / 10631);
  const AA = Z - 10631 * N + 354;
  const K =
    Math.floor((10985 - AA) / 5316) * Math.floor((50 * AA) / 17719) +
    Math.floor(AA / 5670) * Math.floor((43 * AA) / 15238);
  const AL =
    AA -
    Math.floor((30 - K) / 15) * Math.floor((17719 * K) / 50) -
    Math.floor(K / 16) * Math.floor((15238 * K) / 43) +
    29;
  const month = Math.floor((24 * AL) / 709);
  const day = AL - Math.floor((709 * month) / 24);
  const year = 30 * N + K - 29;
  return { year, month, day };
}

function daysUntilNextRamadan(): number {
  const today = new Date();
  const hijri = gregorianToHijri(today);
  if (hijri.month === 9) return 0;
  const probe = new Date(today);
  for (let i = 1; i <= 355; i++) {
    probe.setDate(probe.getDate() + 1);
    const h = gregorianToHijri(probe);
    if (h.month === 9 && h.day === 1) return i;
  }
  return 356;
}

// ── CONTENT ───────────────────────────────────────────────────────────

type RiteCardData = {
  id: "contactPrayers" | "zakat" | "ramadan" | "hajj";
  href: string;
  icon: React.ElementType;
  refs: string[];
};

const RITE_CARDS: RiteCardData[] = [
  {
    id: "contactPrayers",
    href: "/practices/contact-prayers",
    icon: Compass,
    refs: ["4:103", "11:114", "17:78", "24:58"],
  },
  {
    id: "zakat",
    href: "/practices/zakat",
    icon: Wallet,
    refs: ["2:215", "2:267", "6:141", "30:38"],
  },
  {
    id: "ramadan",
    href: "/practices/ramadan",
    icon: Moon,
    refs: ["2:183", "2:184", "2:185", "2:187"],
  },
  {
    id: "hajj",
    href: "/practices/hajj",
    icon: Landmark,
    refs: ["2:158", "2:196", "2:197", "3:97", "22:27"],
  },
];

type QuickLink = {
  href: string;
  id: "prayerTimes" | "zakatCalculator" | "learnTheRites";
  icon: React.ElementType;
};

const QUICK_LINKS: QuickLink[] = [
  { href: "#prayer-times", id: "prayerTimes", icon: MapPin },
  { href: "#zakat-calculator", id: "zakatCalculator", icon: Wallet },
  { href: "#learn-the-rites", id: "learnTheRites", icon: BookOpen },
];

// ── SHARED UI ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="h-px w-10 bg-[var(--ed-accent)]" />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--ed-accent)]"
        style={{ fontFamily: F.glacial }}
      >
        {children}
      </span>
    </div>
  );
}

function RefPill({ reference }: { reference: string }) {
  return (
    <span
      className="inline-flex border border-[var(--ed-rule)] bg-[var(--ed-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ed-fg-muted)] transition-colors duration-300 hover:border-[var(--ed-accent)]/40 hover:text-[var(--ed-accent)]"
      style={{ fontFamily: F.glacial }}
    >
      {reference}
    </span>
  );
}

function VerseQuote({ verseKey, text }: { verseKey: string; text: string }) {
  return (
    <FadeUp className="group" distance={0} initiallyHidden>
      <div className="relative border-l-[3px] border-[var(--ed-accent)]/40 bg-[var(--ed-surface)]/20 p-7 md:p-8">
        <div className="mb-4 flex items-center gap-3">
          <BookOpen size={13} className="text-[var(--ed-accent)] opacity-70" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ed-accent)]"
            style={{ fontFamily: F.glacial }}
          >
            {verseKey}
          </span>
        </div>
        <p
          className="relative text-base italic leading-[1.7] text-[var(--ed-fg-muted)] md:text-lg"
          style={{ fontFamily: F.serif }}
        >
          <span className="absolute -left-1 -top-2 text-4xl text-[var(--ed-accent)]/20 select-none" style={{ fontFamily: F.display }}>
            &ldquo;
          </span>
          {text}
          <span className="text-[var(--ed-accent)]/20 select-none">&rdquo;</span>
        </p>
      </div>
    </FadeUp>
  );
}

function ToolShell({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-[var(--ed-rule)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-16">
        <div className="flex flex-col justify-between gap-10">
          <div className="space-y-6">
            <SectionLabel>{eyebrow}</SectionLabel>
            <div className="space-y-5">
              <h2
                className="text-3xl font-medium tracking-tight text-[var(--ed-fg)] md:text-[2.75rem] md:leading-[1.1]"
                style={{ fontFamily: F.serif }}
              >
                {title}
              </h2>
              <p
                className="max-w-md text-base leading-[1.7] text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.serif }}
              >
                {description}
              </p>
            </div>
          </div>
          {action && <div className="space-y-5">{action}</div>}
        </div>
        <div className="relative border border-[var(--ed-rule)] bg-[var(--ed-surface)]/30 p-6 shadow-[0_2px_8px_rgba(26,23,21,0.02)] sm:p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-[var(--ed-accent)]/20" />
          {children}
        </div>
      </div>
    </section>
  );
}

function RitePreviewCard({
  rite,
  index,
}: {
  rite: RiteCardData;
  index: number;
}) {
  const t = useTranslations("practices");
  const Icon = rite.icon;
  const details = t.raw(`rites.${rite.id}.details`) as string[];

  return (
    <FadeUp distance={12} duration={0.45} initiallyHidden>
      <article className="group relative flex h-full flex-col overflow-hidden border border-[var(--ed-rule)] bg-[var(--ed-bg)] transition-all duration-500 hover:border-[var(--ed-accent)]/50 hover:bg-[var(--ed-surface)]/25">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ed-accent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="flex flex-1 flex-col p-7 sm:p-8 md:p-9">
          <div className="mb-12 flex items-start justify-between gap-6">
            <div className="flex size-12 items-center justify-center border border-[var(--ed-rule)] bg-[var(--ed-surface)]/50 text-[var(--ed-accent)] transition-all duration-500 group-hover:border-[var(--ed-accent)]/40 group-hover:bg-[var(--ed-accent)]/5">
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <span
              className="text-4xl font-medium tabular-nums text-[var(--ed-fg-muted)]/15 transition-colors duration-500 group-hover:text-[var(--ed-accent)]/20"
              style={{ fontFamily: F.display }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="space-y-5">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ed-accent)]"
              style={{ fontFamily: F.glacial }}
            >
              {t(`rites.${rite.id}.eyebrow`)}
            </p>
            <h3
              className="text-2xl font-medium tracking-tight text-[var(--ed-fg)] md:text-[1.75rem]"
              style={{ fontFamily: F.serif }}
            >
              {t(`rites.${rite.id}.title`)}
            </h3>
            <p
              className="text-sm leading-[1.7] text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.serif }}
            >
              {t(`rites.${rite.id}.summary`)}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {rite.refs.map((ref) => (
              <RefPill key={ref} reference={ref} />
            ))}
          </div>

          <ul className="mt-8 grid gap-3 border-t border-[var(--ed-rule)] pt-7">
            {details.map((detail) => (
              <li
                key={detail}
                className="flex items-center gap-3 text-sm text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.serif }}
              >
                <span className="size-1.5 shrink-0 bg-[var(--ed-accent)]/70" />
                {detail}
              </li>
            ))}
          </ul>

          <Link
            href={rite.href}
            className="mt-10 inline-flex min-h-11 items-center justify-between gap-4 border border-[var(--ed-rule)] bg-transparent px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ed-fg)] transition-all duration-300 hover:border-[var(--ed-accent)] hover:bg-[var(--ed-accent)] hover:text-[var(--ed-bg)]"
            style={{ fontFamily: F.glacial }}
          >
            {t(`rites.${rite.id}.cta`)}
            <ArrowRight size={14} strokeWidth={1.8} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </article>
    </FadeUp>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────

export default function PracticesClient({
  prayerVerse,
}: {
  prayerVerse: VerseData | null;
}) {
  const t = useTranslations("practices");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const hasQuery = !!searchParams.get("q");

  useEffect(() => {
    if (!hasQuery) return;
    const el = document.getElementById("prayer-times");
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [hasQuery]);

  const daysUntilRamadan = useMemo(() => daysUntilNextRamadan(), []);
  const showRamadanTool = daysUntilRamadan <= 15;
  const prayerText = prayerVerse?.tr?.[locale]?.tx ?? prayerVerse?.tr?.['en']?.tx;

  return (
    <main className="min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)]">
      {/* ── Hero / Hub Introduction ───────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-[var(--ed-rule)]">
        <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_20%_25%,var(--ed-accent-soft),transparent_40%),radial-gradient(circle_at_80%_80%,color-mix(in_oklab,var(--ed-surface),transparent_60%),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--ed-rule)]" />
        
        <div className="mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-24 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,390px)] md:pb-28 md:pt-32 lg:gap-20">
          <FadeUp distance={10} duration={0.5} className="flex flex-col justify-between gap-10">
            <div className="space-y-8">
              <SectionLabel>Practices Hub</SectionLabel>
              <h1
                className="max-w-3xl text-[3.25rem] font-medium leading-[1.05] tracking-tight text-[var(--ed-fg)] md:text-[4.5rem] lg:text-[5rem]"
                style={{ fontFamily: F.serif }}
              >
                {t("heading")}
              </h1>
              <p
                className="max-w-2xl text-lg italic leading-[1.6] text-[var(--ed-fg-muted)] md:text-xl"
                style={{ fontFamily: F.serif }}
              >
                {t("description")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex min-h-11 items-center gap-3 border border-[var(--ed-rule)] bg-[var(--ed-bg)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--ed-fg-muted)] transition-all duration-300 hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)] hover:shadow-[0_2px_12px_rgba(107,52,16,0.06)]"
                    style={{ fontFamily: F.glacial }}
                  >
                    <Icon size={14} strokeWidth={1.6} />
                    {t(item.id === "prayerTimes" ? "prayerTimesLookup" : item.id === "zakatCalculator" ? "zakatCalculator" : "learnTheRites")}
                  </Link>
                );
              })}
            </div>
          </FadeUp>

          <FadeUp distance={14} duration={0.55} className="self-end">
            <div className="relative border border-[var(--ed-rule)] bg-[var(--ed-bg)]/90 p-7 backdrop-blur-sm md:p-8">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ed-accent)]/30" />
              <div className="mb-10 flex items-center justify-between gap-4">
                <Sparkles
                  size={24}
                  className="text-[var(--ed-accent)]"
                  strokeWidth={1.5}
                />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ed-fg-muted)]"
                  style={{ fontFamily: F.glacial }}
                >
                  {t("learnPlusUse")}
                </span>
              </div>
              <p
                className="text-[1.65rem] font-medium leading-[1.25] text-[var(--ed-fg)] md:text-[2rem]"
                style={{ fontFamily: F.serif }}
              >
                {t("learnPlusUseDesc")}
              </p>
              <div className="mt-10 grid grid-cols-2 gap-px border border-[var(--ed-rule)] bg-[var(--ed-rule)]">
                {["Prayer times", "Zakat", "Ramadan", "Hajj"].map((item) => (
                  <div key={item} className="bg-[var(--ed-bg)] p-4 transition-colors duration-300 hover:bg-[var(--ed-surface)]/40">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ed-accent)]"
                      style={{ fontFamily: F.glacial }}
                    >
                      {item === "Prayer times" ? t("prayerTimesLookup") : item === "Zakat" ? t("rites.zakat.title") : item === "Ramadan" ? t("rites.ramadan.title") : t("rites.hajj.title")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Quick Tools ───────────────────────────────────────────────── */}
      <section className="relative border-b border-[var(--ed-rule)] bg-[var(--ed-surface)]/[0.07]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20">
          <div className="mb-12 max-w-2xl">
            <SectionLabel>{t("quickAccess")}</SectionLabel>
            <h2
              className="text-3xl font-medium tracking-tight text-[var(--ed-fg)] md:text-[2.75rem] md:leading-[1.1]"
              style={{ fontFamily: F.serif }}
            >
              {t("quickAccessDesc")}
            </h2>
            <p
              className="mt-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.serif }}
            >
              {t("quickAccessSubDesc")}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <a
              href="#prayer-times"
              className="group flex items-center justify-between border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-6 transition-all duration-300 hover:border-[var(--ed-accent)]/50 hover:bg-[var(--ed-surface)]/20 hover:shadow-[0_4px_20px_rgba(26,23,21,0.04)]"
            >
              <div className="flex items-center gap-5">
                <span className="flex size-12 items-center justify-center border border-[var(--ed-rule)] text-[var(--ed-accent)] transition-all duration-300 group-hover:border-[var(--ed-accent)]/30 group-hover:bg-[var(--ed-accent)]/5">
                  <MapPin size={18} strokeWidth={1.7} />
                </span>
                <div>
                  <h3
                    className="text-xl font-medium text-[var(--ed-fg)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t("prayerTimesLookup")}
                  </h3>
                  <p
                    className="mt-1 text-sm text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t("prayerTimesLookupDesc")}
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-[var(--ed-fg-muted)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--ed-accent)]"
              />
            </a>

            <a
              href="#zakat-calculator"
              className="group flex items-center justify-between border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-6 transition-all duration-300 hover:border-[var(--ed-accent)]/50 hover:bg-[var(--ed-surface)]/20 hover:shadow-[0_4px_20px_rgba(26,23,21,0.04)]"
            >
              <div className="flex items-center gap-5">
                <span className="flex size-12 items-center justify-center border border-[var(--ed-rule)] text-[var(--ed-accent)] transition-all duration-300 group-hover:border-[var(--ed-accent)]/30 group-hover:bg-[var(--ed-accent)]/5">
                  <Wallet size={18} strokeWidth={1.7} />
                </span>
                <div>
                  <h3
                    className="text-xl font-medium text-[var(--ed-fg)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t("zakatCalculator")}
                  </h3>
                  <p
                    className="mt-1 text-sm text-[var(--ed-fg-muted)]"
                    style={{ fontFamily: F.serif }}
                  >
                    {t("zakatCalculatorDesc")}
                  </p>
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-[var(--ed-fg-muted)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--ed-accent)]"
              />
            </a>
          </div>
        </div>
      </section>

      <ToolShell
        id="prayer-times"
        eyebrow={t("contactPrayerTool")}
        title={t("findTodaysPrayerTimes")}
        description={t("prayerToolDesc")}
        action={
          <div className="space-y-6">
            {prayerText && <VerseQuote verseKey="4:103" text={prayerText} />}
            <Link
              href="/practices/contact-prayers"
              className="inline-flex min-h-11 items-center gap-3 border border-[var(--ed-rule)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--ed-fg-muted)] transition-all duration-300 hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)] hover:shadow-[0_2px_12px_rgba(107,52,16,0.06)]"
              style={{ fontFamily: F.glacial }}
            >
              {t("fullContactPrayersGuide")}
              <ArrowRight size={14} strokeWidth={1.6} />
            </Link>
          </div>
        }
      >
        <PrayerTimesClient />
      </ToolShell>

      <ToolShell
        id="zakat-calculator"
        eyebrow={t("zakatTool")}
        title={t("calculateZakatQuickly")}
        description={t("zakatToolDesc")}
        action={
          <Link
            href="/practices/zakat"
            className="inline-flex min-h-11 items-center gap-3 border border-[var(--ed-rule)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--ed-fg-muted)] transition-all duration-300 hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)] hover:shadow-[0_2px_12px_rgba(107,52,16,0.06)]"
            style={{ fontFamily: F.glacial }}
          >
            {t("fullZakatGuide")}
            <ArrowRight size={14} strokeWidth={1.6} />
          </Link>
        }
      >
        <ZakatCalculator />
      </ToolShell>

      {showRamadanTool && (
        <ToolShell
          id="ramadan-schedule"
          eyebrow={t("ramadanTool")}
          title={t("checkRamadanDates")}
          description={t("ramadanToolDesc")}
          action={
            <div className="flex flex-wrap items-center gap-5">
              {daysUntilRamadan > 0 && (
                <span
                  className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ed-accent)]"
                  style={{ fontFamily: F.glacial }}
                >
                  <span className="size-2 bg-[var(--ed-accent)]" />
                  {t("tMinus", { days: daysUntilRamadan })}
                </span>
              )}
              <Link
                href="/practices/ramadan"
                className="inline-flex min-h-11 items-center gap-3 border border-[var(--ed-rule)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--ed-fg-muted)] transition-all duration-300 hover:border-[var(--ed-accent)] hover:text-[var(--ed-fg)] hover:shadow-[0_2px_12px_rgba(107,52,16,0.06)]"
                style={{ fontFamily: F.glacial }}
              >
                {t("fullFastingGuide")}
                <ArrowRight size={14} strokeWidth={1.6} />
              </Link>
            </div>
          }
        >
          <RamadanClient />
        </ToolShell>
      )}

      {/* ── Rite Index ────────────────────────────────────────────────── */}
      <section
        id="learn-the-rites"
        className="relative border-t border-[var(--ed-rule)] bg-[var(--ed-surface)]/[0.04]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--ed-rule)]" />
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 md:py-28">
          <div className="mb-14 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <SectionLabel>{t("learnTheRites")}</SectionLabel>
              <h2
                className="text-3xl font-medium tracking-tight text-[var(--ed-fg)] md:text-[2.75rem] md:leading-[1.1]"
                style={{ fontFamily: F.serif }}
              >
                {t("eachPracticeHasFullGuide")}
              </h2>
              <p
                className="mt-6 text-base leading-[1.7] text-[var(--ed-fg-muted)]"
                style={{ fontFamily: F.serif }}
              >
                {t("learnTheRitesDesc")}
              </p>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ed-fg-muted)]/50"
              style={{ fontFamily: F.glacial }}
            >
              {t("fourCoreGuides")}
            </span>
          </div>

          <div className="grid gap-px border border-[var(--ed-rule)] bg-[var(--ed-rule)] md:grid-cols-2">
            {RITE_CARDS.map((rite, index) => (
              <RitePreviewCard key={rite.href} rite={rite} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--ed-rule)] bg-[var(--ed-surface)]/[0.07]">
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--ed-accent)]/10" />
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
          <div className="max-w-2xl">
            <p
              className="text-[1.65rem] font-medium leading-[1.3] text-[var(--ed-fg)] md:text-[2rem]"
              style={{ fontFamily: F.serif }}
            >
              {t("closingMessage")}
            </p>
          </div>
          <Link
            href="/practices/contact-prayers"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 border border-[var(--ed-accent)] bg-[var(--ed-accent)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ed-bg)] transition-all duration-300 hover:bg-[var(--ed-fg)] hover:border-[var(--ed-fg)]"
            style={{ fontFamily: F.glacial }}
          >
            {t("beginWithPrayer")}
            <ArrowRight size={15} strokeWidth={1.8} />
          </Link>
        </div>
      </section>
    </main>
  );
}
