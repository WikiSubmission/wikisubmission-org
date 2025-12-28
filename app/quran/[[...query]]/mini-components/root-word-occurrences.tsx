"use client";

import { useState, useEffect } from "react";
import { ws } from "@/lib/wikisubmission-sdk";
import { Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface WordOccurrence {
    verse_id: string;
    chapter_number: number;
    verse_number: number;
    word_index: number;
    arabic: string;
    english: string;
    transliterated: string;
    root_word: string;
}

export function RootWordOccurrences({ rootWord }: { rootWord: string }) {
    const [occurrences, setOccurrences] = useState<WordOccurrence[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOccurrences() {
            setLoading(true);
            try {
                const { data, error } = await ws.supabase
                    .from("ws_quran_word_by_word")
                    .select("*")
                    .eq("root_word", rootWord)
                    .order("chapter_number", { ascending: true })
                    .order("verse_number", { ascending: true })
                    .order("word_index", { ascending: true });

                if (error) throw error;
                setOccurrences(data || []);
            } catch (err) {
                console.error("Error fetching root word occurrences:", err);
            } finally {
                setLoading(false);
            }
        }

        if (rootWord) {
            fetchOccurrences();
        }
    }, [rootWord]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin size-6 text-violet-600" />
            </div>
        );
    }

    return (
        <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-3">
                {occurrences.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No other occurrences found.</p>
                ) : (
                    occurrences.map((occ, idx) => (
                        <div key={idx} className="bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-xl border border-border/40">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <Link
                                        href={`/quran/${occ.chapter_number}?verse=${occ.verse_number}&word=${occ.word_index}`}
                                        className="text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1 uppercase tracking-wider"
                                        target="_blank"
                                    >
                                        {occ.verse_id}:{occ.word_index}
                                        <ArrowUpRight className="size-2.5" />
                                    </Link>
                                    <p className="text-sm font-medium">{occ.english}</p>
                                    <p className="text-[10px] text-muted-foreground italic">{occ.transliterated}</p>
                                </div>
                                <div className="text-xl font-arabic text-right">
                                    {occ.arabic}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
