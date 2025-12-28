'use client'

import { PageSwitcher } from "@/components/page-switcher";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/toggles/theme-toggle";
import { GeometryDots } from "@/components/geometry-dots";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchIcon, MapPinIcon, ClockIcon, AlertCircleIcon, ChevronRight, InfoIcon, ShareIcon } from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import Link from "next/link";
import { FaApple } from "react-icons/fa";
import { toast } from "sonner";

export default function PrayerTimesPage() {
    return (
        <main className="min-h-screen text-foreground flex flex-col items-center p-4 md:p-2">
            <GeometryDots />

            {/* Minimal Header */}
            <div className="w-full max-w-5xl px-4 h-16 flex items-center justify-between z-10">
                <PageSwitcher currentPage="prayertimes" />
                <ThemeToggle />
            </div>

            <div className="w-full max-w-2xl px-4 py-12 md:py-24 z-10">
                <Link href="/">
                    <Image src="/brand-assets/logo-transparent.png" alt="WikiSubmission Logo"
                        width={125}
                        height={125}
                        className="justify-center items-center mx-auto rounded-full my-4"
                    />
                </Link>
                <Suspense fallback={<div className="text-center opacity-20"><ClockIcon className="size-8 mx-auto animate-spin" /></div>}>
                    <PrayerTimesContent />
                </Suspense>
            </div>
        </main>
    );
}
function PrayerTimesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const asrAdjustment = searchParams.get('asr_adjustment') === 'true';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [data, setData] = useState<PrayerTimesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPrayerTimes = useCallback(async (location: string, adjustment: boolean) => {
        if (!location) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = `https://practices.wikisubmission.org/prayer-times/${encodeURIComponent(location)}${adjustment ? '?asr_adjustment=true' : ''}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Location not found');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialQuery) {
            fetchPrayerTimes(initialQuery, asrAdjustment);
        }
    }, [initialQuery, asrAdjustment, fetchPrayerTimes]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('q', trimmed);
            router.push(`/prayer-times?${params.toString()}`);
        }
    };

    const toggleAsrAdjustment = (checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        if (checked) {
            params.set('asr_adjustment', 'true');
        } else {
            params.delete('asr_adjustment');
        }
        router.replace(`/prayer-times?${params.toString()}`, { scroll: false });
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("URL copied to clipboard");
        }).catch(() => {
            toast.error("Failed to copy URL");
        });
    };

    const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    return (
        <div className="w-full max-w-lg mx-auto space-y-8">

            {/* Search Section */}
            <div className="space-y-4">
                <form onSubmit={handleSearch} className="w-full relative group">
                    <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                    <Input
                        type="search"
                        placeholder="Search city..."
                        className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="flex items-center justify-end space-x-2 px-1 -mt-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="asr-method" className="text-[10px] text-muted-foreground font-light cursor-pointer">
                            Asr: use midpoint method
                        </Label>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <InfoIcon className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-center">
                                Midpoint method refers to the exact mid-point between noon and sunset, which starts slightly earlier than traditional methods.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Switch
                        id="asr-method"
                        checked={asrAdjustment}
                        onCheckedChange={toggleAsrAdjustment}
                        className="scale-75 origin-right"
                    />
                </div>
            </div>

            {loading && (
                <div className="space-y-4 pt-8">
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
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <header className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                            <MapPinIcon className="size-3.5" />
                            <span className="text-sm font-medium">{data.location_string}</span>
                        </div>
                        <h2 className="text-lg font-semibold">{data.status_string}</h2>
                    </header>

                    <div className="divide-y divide-border/40">
                        {prayerOrder.map((prayer) => {
                            const isCurrent = data.current_prayer.toLowerCase() === prayer;
                            const isUpcoming = data.upcoming_prayer.toLowerCase() === prayer;
                            const timeLeft = data.times_left[prayer as keyof typeof data.times_left];
                            const isUrgent = timeLeft && !timeLeft.includes('h');

                            return (
                                <div
                                    key={prayer}
                                    className={cn(
                                        "flex items-center justify-between py-4 px-2 hover:bg-muted/30 transition-colors",
                                        isCurrent && "bg-violet-50 dark:bg-violet-900/10 rounded-lg -mx-4 px-6 border-l-2 border-violet-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {isCurrent && <ClockIcon className="size-3.5 text-violet-600 animate-pulse" />}
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "capitalize text-sm font-medium",
                                                    isCurrent ? "text-violet-600" : "text-muted-foreground"
                                                )}>
                                                    {prayer}
                                                </span>
                                                {isUpcoming && timeLeft && (
                                                    <span className={cn(
                                                        "text-[10px] normal-case",
                                                        isUrgent ? "text-red-600 font-bold animate-pulse" : "text-muted-foreground font-light"
                                                    )}>
                                                        in {timeLeft}
                                                    </span>
                                                )}
                                                {isCurrent && data.current_prayer_time_elapsed && (
                                                    <span className="text-[10px] normal-case text-violet-600 font-light">
                                                        started {data.current_prayer_time_elapsed} ago
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-mono tabular-nums",
                                        isCurrent ? "font-bold text-violet-600" : "text-foreground"
                                    )}>
                                        {data.times[prayer as keyof typeof data.times]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <section className="flex flex-col">
                        <Item asChild variant="outline">
                            <Link href="https://apps.apple.com/us/app/submission-religion-of-god/id6444260632" target="_blank" rel="noopener noreferrer">
                                <ItemContent>
                                    <ItemTitle>
                                        iOS App
                                    </ItemTitle>
                                    <ItemDescription>
                                        Get real-time prayer notifications
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <FaApple className="size-8" />
                                    <ChevronRight className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                    </section>

                    <footer className="flex flex-col items-center gap-2 text-[10px] text-muted-foreground justify-center uppercase tracking-widest pt-4">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-violet-600 hover:text-violet-500 transition-colors cursor-pointer focus:outline-none"
                        >
                            <ShareIcon className="size-3" />
                            <p>
                                SHARE THIS PAGE
                            </p>
                        </button>
                        <span>{`${data.coordinates.latitude}°N, ${data.coordinates.longitude}°E`}</span>
                        <span>{data.local_timezone}</span>
                    </footer>
                </div>
            )}
        </div>
    );
}

interface PrayerTimesResponse {
    status_string: string;
    location_string: string;
    country: string;
    country_code: string;
    city: string;
    region: string;
    local_time: string;
    local_timezone: string;
    local_timezone_id: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    times: {
        fajr: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
        sunrise: string;
        sunset: string;
    };
    times_in_utc: {
        fajr: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
        sunrise: string;
        sunset: string;
    };
    times_left: {
        fajr: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
        sunrise: string;
        sunset: string;
    };
    current_prayer: string;
    upcoming_prayer: string;
    current_prayer_time_elapsed: string;
    upcoming_prayer_time_left: string;
}