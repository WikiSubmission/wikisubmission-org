'use client';

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuranSearchbar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q')?.toString() || "");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const currentQ = searchParams.get('q')?.toString() || "";
            if (searchQuery === currentQ) return;

            const params = new URLSearchParams(searchParams);
            if (searchQuery) {
                params.set('q', searchQuery);
            } else {
                params.delete('q');
            }
            replace(`${pathname}?${params.toString()}`);
        }, 350);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchParams, pathname, replace]);

    return (
        <div className="relative w-full">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
            <Input
                type="search"
                placeholder="Search Quran"
                className="pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                }}
            />
        </div>
    );
}