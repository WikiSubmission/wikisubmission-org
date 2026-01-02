'use client'

import { PageSwitcher } from "@/components/page-switcher";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { SearchIcon, MapPinIcon, AlertCircleIcon, ShareIcon, MoonIcon, CalendarIcon, StarsIcon } from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function RamadanClient() {
    return (
        <main className="min-h-screen text-foreground flex flex-col items-center p-4 md:p-2">
            {/* Minimal Header */}
            <div className="w-full max-w-5xl px-4 h-16 flex items-center justify-between z-10">
                <PageSwitcher currentPage="ramadan" />
                <ThemeToggle />
            </div>

            <div className="w-full max-w-4xl px-4 py-12 md:py-16 z-10">
                <div className="flex flex-col items-center mb-12">
                    <Link href="/">
                        <Image src="/brand-assets/logo-transparent.png" alt="WikiSubmission Logo"
                            width={48}
                            height={48}
                            className="rounded-full mb-4"
                        />
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent italic uppercase pr-2">
                        Ramadan
                    </h1>
                </div>
                <Suspense fallback={<div className="text-center opacity-20"><MoonIcon className="size-8 mx-auto animate-spin" /></div>}>
                    <RamadanContent />
                </Suspense>
            </div>
        </main>
    );
}

function RamadanContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const initialYear = searchParams.get('year') || new Date().getFullYear().toString();

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [year, setYear] = useState(initialYear);
    const [data, setData] = useState<RamadanResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRamadanSchedule = useCallback(async (location: string, year: string) => {
        if (!location) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = `https://practices.wikisubmission.org/ramadan/${encodeURIComponent(location)}?year=${year}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Location not found');
            }
            const result: RamadanResponse = await response.json();
            setData(result);

            // Update URL purely for browser navigation/sharing without triggering re-render
            if (result.location.address) {
                const currentParams = new URLSearchParams(window.location.search);
                if (currentParams.get('q') !== result.location.address) {
                    currentParams.set('q', result.location.address);
                    currentParams.set('year', result.year);
                    const newPath = `${window.location.pathname}?${currentParams.toString()}`;
                    window.history.replaceState(null, '', newPath);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialQuery) {
            fetchRamadanSchedule(initialQuery, initialYear);
        }
    }, [initialQuery, initialYear, fetchRamadanSchedule]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('q', trimmed);
            params.set('year', year);
            router.push(`/ramadan?${params.toString()}`);
        }
    };

    const handleYearChange = (newYear: string) => {
        setYear(newYear);
        if (searchQuery.trim()) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('q', searchQuery.trim());
            params.set('year', newYear);
            router.push(`/ramadan?${params.toString()}`);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("URL copied to clipboard");
        }).catch(() => {
            toast.error("Failed to copy URL");
        });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString());

    return (
        <div className="w-full space-y-8">
            {/* Search Section */}
            <div className="w-full max-w-lg mx-auto space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 group">
                        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                        <Input
                            type="search"
                            placeholder="Search location..."
                            className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        value={year}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="w-[100px] h-8 border-0 bg-secondary focus:ring-0 rounded-xl px-3 text-[10px] appearance-none cursor-pointer uppercase tracking-tight text-muted-foreground/80 font-medium"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </form>
            </div>

            {loading && (
                <div className="space-y-4 pt-8 max-w-lg mx-auto">
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-destructive py-8 justify-center">
                    <AlertCircleIcon className="size-4" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {data && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <header className="text-center space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPinIcon className="size-3.5" />
                                <span className="text-sm font-medium">{data.location.address}</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-violet-600 drop-shadow-sm">{data.year} Ramadan Schedule</h2>
                            <p className="text-lg text-foreground/80 max-w-xl mx-auto font-medium">
                                {data.status_string}
                            </p>
                        </div>
                    </header>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard
                            title="First Fasting Day"
                            value={data.summary.first_fasting_day}
                            icon={<CalendarIcon className="size-4 text-violet-500" />}
                        />
                        <SummaryCard
                            title="Last Fasting Day"
                            value={data.summary.last_fasting_day}
                            icon={<CalendarIcon className="size-4 text-violet-500" />}
                        />
                        <SummaryCard
                            title="Night of Destiny"
                            value={data.summary.night_of_destiny}
                            icon={<StarsIcon className="size-4 text-amber-500" />}
                            description="(Night 27)"
                        />
                        <SummaryCard
                            title="Last 10 Nights Start"
                            value={data.summary.begin_last_10_nights}
                            icon={<MoonIcon className="size-4 text-blue-500" />}
                        />
                    </div>

                    {/* Schedule Table */}
                    <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/30">
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Day</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Date</th>
                                    <th className="px-4 py-3 font-semibold text-violet-600/80">Dawn (Start)</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Noon</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Afternoon</th>
                                    <th className="px-4 py-3 font-semibold text-red-600/80">Sunset (End)</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Night</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {data.schedule.map((day) => (
                                    <tr
                                        key={day.day_number}
                                        className={cn(
                                            "hover:bg-muted/30 transition-colors",
                                            day.day_number === data.current_day && "bg-violet-600/10"
                                        )}
                                    >
                                        <td className="px-4 py-3 font-medium">{day.day_number}</td>
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{day.day}</td>
                                        <td className="px-4 py-3 font-mono text-violet-600 font-semibold">{stripAmPm(day.dawn)}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono">{stripAmPm(day.noon)}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-center">{stripAmPm(day.afternoon)}</td>
                                        <td className="px-4 py-3 font-mono text-red-600 font-semibold">{stripAmPm(day.sunset)}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono">{stripAmPm(day.night)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Moon Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 px-6 rounded-2xl bg-secondary/20 border border-border/40">
                        <MoonDataSection title="Ramadan Start Moon" moon={data.moon_data.start} />
                        <MoonDataSection title="Ramadan End Moon" moon={data.moon_data.end} />
                    </div>

                    <footer className="flex flex-col items-center gap-4 text-[10px] text-muted-foreground justify-center uppercase tracking-widest pt-4">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-violet-600 hover:text-violet-500 transition-colors cursor-pointer focus:outline-none bg-violet-600/5 px-4 py-2 rounded-full"
                        >
                            <ShareIcon className="size-3" />
                            <p className="font-semibold">
                                SHARE THIS SCHEDULE
                            </p>
                        </button>
                        <div className="flex flex-col items-center gap-1 opacity-60">
                            <span>{`${data.location.latitude}°N, ${data.location.longitude}°E`}</span>
                            <span>{data.location.timezone}</span>
                        </div>
                    </footer>
                </div>
            )}
        </div>
    );
}

const stripAmPm = (time: string) => time.replace(/\s?[AP]M/gi, '');

function SummaryCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description?: string }) {
    return (
        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-sm space-y-1">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{value}</span>
                {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
            </div>
        </div>
    );
}

function MoonDataSection({ title, moon }: { title: string, moon: RamadanResponse['moon_data']['start'] }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-violet-600 uppercase tracking-widest">{title}</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">New Moon (Local)</span>
                    <span className="font-mono">{moon.new_moon_local}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Sunset (Local)</span>
                    <span className="font-mono">{moon.sunset_local}</span>
                </div>
                <div className="pt-2 text-[10px] text-muted-foreground/60 border-t border-border/40 font-mono">
                    UTC: {moon.new_moon_utc}
                </div>
            </div>
        </div>
    );
}

interface RamadanResponse {
    query: string;
    year: string;
    current_day: number;
    status_string: string;
    location: {
        address: string;
        city: string;
        country: string;
        latitude: number;
        longitude: number;
        timezone: string;
    };
    summary: {
        first_fasting_day: string;
        last_fasting_day: string;
        night_of_destiny: string;
        begin_last_10_nights: string;
    };
    moon_data: {
        start: {
            new_moon_utc: string;
            new_moon_local: string;
            sunset_local: string;
        };
        end: {
            new_moon_utc: string;
            new_moon_local: string;
            sunset_local: string;
        };
    };
    schedule: {
        day_number: number;
        day: string;
        dawn: string;
        sunrise: string;
        noon: string;
        afternoon: string;
        sunset: string;
        night: string;
    }[];
}
