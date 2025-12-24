import { highlightMarkdown } from "@/lib/highlight-markdown";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { SearchHitWordByWord } from "wikisubmission-sdk/lib/quran/v1/query-result";

export function QuranWordResultItem({ verse }: { verse: SearchHitWordByWord }) {
    return (
        <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
            <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground tracking-wider">
                    {verse.verse_id}
                </p>
                <Link href={`?q=${verse.verse_id}&word=${verse.word_index}`} target="_blank" className="hover:cursor-pointer text-violet-500 border border-violet-500 rounded-full p-1">
                    <ArrowRightIcon className="size-2" />
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