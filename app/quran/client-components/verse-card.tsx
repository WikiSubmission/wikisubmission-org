import { SearchHit, SearchHitFootnote, SearchHitSubtitle, SearchHitText } from "wikisubmission-sdk/lib/quran/v1/query-result";

export function QuranSearchResultItem({ verse }: { verse: SearchHit | SearchHitText | SearchHitSubtitle | SearchHitFootnote }) {

    if (verse.hit === "text") {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4">

                <section>
                    <p>
                        <strong>[{verse.verse_id}]</strong> {verse.english}
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
    } else if (verse.hit === "subtitle") {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground tracking-wider">
                    SUBTITLE - {verse.verse_id}
                </p>
                <section>
                    <p className="text-violet-600">
                        {verse.english}
                    </p>
                </section>
            </div>
        )
    } else if (verse.hit === "footnote") {
        return (
            <div className="space-y-2 bg-muted/50 rounded-2xl p-4 text-muted-foreground">
                <p className="text-xs text-muted-foreground tracking-wider">
                    FOOTNOTE - {verse.verse_id}
                </p>
                <section>
                    <p className="italic">
                        {verse.english}
                    </p>
                </section>
            </div>
        )
    }
}