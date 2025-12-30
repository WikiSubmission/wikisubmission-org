import { SearchHitText, SearchHitSubtitle, SearchHitFootnote, SearchHit } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import { highlightMarkdown } from "@/lib/highlight-markdown";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

export function SearchItemAllMatches({ props }: { props: { results: SearchHit | SearchHitText | SearchHitSubtitle | SearchHitFootnote } }) {
    const quranPreferences = useQuranPreferences();

    if (props.results.hit === "text" && quranPreferences.text) {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
                <Link
                    href={`/quran/${props.results.chapter_number}?verse=${props.results.verse_number}`}
                    target="_blank"
                    className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
                >
                    <p>
                        TEXT - {props.results.verse_id}
                    </p>
                    <ArrowUpRightIcon className="size-4" />
                </Link>

                <section>
                    <p>
                        <strong>[{props.results.verse_id}]</strong> {highlightMarkdown(props.results.english)}
                    </p>
                </section>

                {quranPreferences.secondaryLanguage &&
                    <section>
                        <p>
                            <strong>[{props.results.verse_id}]</strong> {highlightMarkdown(props.results[quranPreferences.secondaryLanguage])}
                        </p>
                    </section>
                }

                <section dir="rtl">
                    <p className="text-right text-xl tracking-widest">
                        {props.results.arabic}
                    </p>
                </section>
            </div>
        )
    } else if (props.results.hit === "subtitle" && quranPreferences.subtitles) {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
                <Link
                    href={`/quran/${props.results.chapter_number}?verse=${props.results.verse_number}`}
                    target="_blank"
                    className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
                >
                    <p>
                        SUBTITLE - {props.results.verse_id}
                    </p>
                    <ArrowUpRightIcon className="size-4" />
                </Link>
                <section>
                    <p>
                        {highlightMarkdown(props.results.english)}
                    </p>
                </section>
            </div>
        )
    } else if (props.results.hit === "footnote" && quranPreferences.footnotes) {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4 text-muted-foreground">
                <Link
                    href={`/quran/${props.results.chapter_number}?verse=${props.results.verse_number}`}
                    target="_blank"
                    className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
                >
                    <p>
                        FOOTNOTE - {props.results.verse_id}
                    </p>
                    <ArrowUpRightIcon className="size-4" />
                </Link>
                <section>
                    <p className="italic text-sm">
                        {highlightMarkdown(props.results.english)}
                    </p>
                </section>
            </div>
        )
    }
}