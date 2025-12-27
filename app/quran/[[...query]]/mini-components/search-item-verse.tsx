import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { highlightMarkdown } from "@/lib/highlight-markdown";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { SearchHit, SearchHitFootnote, SearchHitSubtitle, SearchHitText } from "wikisubmission-sdk/lib/quran/v1/query-result";

export function SearchItemVerse({ verse }: { verse: SearchHit | SearchHitText | SearchHitSubtitle | SearchHitFootnote }) {
    const quranPreferences = useQuranPreferences();

    if (verse.hit === "text") {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
                <Link
                    href={`/quran/${verse.chapter_number}?verse=${verse.verse_number}`}
                    target="_blank"
                    className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
                >
                    <p>
                        TEXT - {verse.verse_id}
                    </p>
                    <ArrowUpRightIcon className="size-4" />
                </Link>

                <section>
                    <p>
                        <strong>[{verse.verse_id}]</strong> {highlightMarkdown(verse.english)}
                    </p>
                </section>

                {quranPreferences.secondaryLanguage &&
                    <section>
                        <p>
                            <strong>[{verse.verse_id}]</strong> {highlightMarkdown(verse[quranPreferences.secondaryLanguage])}
                        </p>
                    </section>
                }

                {'arabic' in verse &&
                    <section className="text-rtl text-right text-lg">
                        <p>
                            {verse.arabic}
                        </p>
                    </section>
                }
            </div>
        )
    } else if (verse.hit === "subtitle") {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
                <Link
                    href={`/quran/${verse.chapter_number}?verse=${verse.verse_number}`}
                    target="_blank"
                    className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
                >
                    <p>
                        SUBTITLE - {verse.verse_id}
                    </p>
                    <ArrowUpRightIcon className="size-4" />
                </Link>
                <section>
                    <p>
                        {highlightMarkdown(verse.english)}
                    </p>
                </section>
            </div>
        )
    } else if (verse.hit === "footnote") {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4 text-muted-foreground">
                <Link
                    href={`/quran/${verse.chapter_number}?verse=${verse.verse_number}`}
                    target="_blank"
                    className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
                >
                    <p>
                        FOOTNOTE - {verse.verse_id}
                    </p>
                    <ArrowUpRightIcon className="size-4" />
                </Link>
                <section>
                    <p className="italic">
                        {highlightMarkdown(verse.english)}
                    </p>
                </section>
            </div>
        )
    }
}