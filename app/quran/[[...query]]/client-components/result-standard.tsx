'use client';

import { QueryResultChapter, QueryResultMultipleVerses, QueryResultVerse } from "wikisubmission-sdk/lib/quran/v1/query-result";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StandardItemTitle } from "../mini-components/standard-item-title";
import { StandardItemVerses } from "../mini-components/standard-item-verses";

export function StandardResult({ props }: { props: { query: string, data: QueryResultChapter | QueryResultVerse | QueryResultMultipleVerses } }) {
    return (
        <div className="space-y-8">
            <StandardItemTitle props={props} />
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