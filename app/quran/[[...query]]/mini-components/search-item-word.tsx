import { highlightMarkdown } from "@/lib/highlight-markdown";
import { ArrowUpRightIcon } from "lucide-react";
import { SearchHitWordByWord } from "wikisubmission-sdk/lib/quran/v1/query-result";
import Link from "next/link";

export function SearchItemWord({ verse }: { verse: SearchHitWordByWord }) {
    return (
        <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
            <div className="flex justify-between items-center">
                <Link
                    href={`/quran/${verse.chapter_number}?verse=${verse.verse_number}`}
                    target="_blank"
                    className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
                >
                    <p>
                        WORD {verse.word_index} - {verse.verse_id}
                    </p>
                    <ArrowUpRightIcon className="size-4" />
                </Link>
            </div>
            <section className="flex justify-between items-center">
                <p>
                    {highlightMarkdown(verse.english)}
                </p>

                {'arabic' in verse &&
                    <section className="text-rtl text-right text-lg">
                        <p>
                            {verse.arabic}
                        </p>
                    </section>
                }
            </section>
        </div>
    )
}