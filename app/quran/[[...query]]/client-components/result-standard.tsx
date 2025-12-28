'use client';

import { QueryResultChapter, QueryResultMultipleVerses, QueryResultVerse } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookIcon, ChevronRight } from "lucide-react";
import { StandardItemTitle } from "../mini-components/standard-item-title";
import { StandardItemVerses } from "../mini-components/standard-item-verses";
import Link from "next/link";

export function StandardResult({ props }: { props: { query: string, data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses } }) {
    const indexAdjustment = ((props.data.data[0].chapter_number === 1 || props.data.data[0].chapter_number === 9) ? 0 : 1);
    return (
        <div className="space-y-4">
            <StandardItemTitle props={props} />
            <div>
                {(props.data.data.length - indexAdjustment) !== props.data.data[0].chapter_verses && (
                    <Link href={`/quran/${props.data.data[0].chapter_number}?verse=${props.data.data[0].verse_number}`}>
                        <Button variant="secondary" size="sm">
                            <BookIcon />
                            Load full chapter
                            <ChevronRight />
                        </Button>
                    </Link>
                )}
            </div>
            <StandardItemVerses props={props} />

            {/* Navigation */}
            <section className="bg-muted/50 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                    {/* Previous Chapter */}
                    {props.data.data[0].chapter_number > 1 && (
                        <a href={`/quran/${props.data.data[0].chapter_number - 1}`}>
                            <Button variant="secondary">
                                <ArrowLeft />
                                Chapter {props.data.data[0].chapter_number - 1}
                            </Button>
                        </a>
                    )}

                    {/* Next Chapter */}
                    {props.data.data[0].chapter_number < 114 && (
                        <a href={`/quran/${props.data.data[0].chapter_number + 1}`}>
                            <Button variant="secondary">
                                Chapter {props.data.data[0].chapter_number + 1}
                                <ArrowRight />
                            </Button>
                        </a>
                    )}
                </div>
            </section>
        </div>
    );
}