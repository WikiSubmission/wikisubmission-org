import { highlightMarkdown } from "@/lib/highlight-markdown";
import { SearchHitWordByWord } from "wikisubmission-sdk/lib/quran/v1/query-result";

export function QuranWordResultItem({ verse }: { verse: SearchHitWordByWord }) {
    return (
        <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground tracking-wider">
                {verse.verse_id}
            </p>
            <section>
                <p>
                    {highlightMarkdown(verse.english)}
                </p>
            </section>

            {'arabic' in verse &&
                <section className="text-rtl text-right text-lg">
                    <p>
                        {verse.arabic}
                    </p>
                </section>
            }
        </div>
    )
}