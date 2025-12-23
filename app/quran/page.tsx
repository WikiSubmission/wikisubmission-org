import SearchResult from "./client-components/search-result";

export default function QuranPage() {
    return (
        <main className="space-y-4">
            <section className="space-y-2">
                <h2 className="text-2xl font-light text-muted-foreground tracking-widest">
                    THE FINAL TESTAMENT
                </h2>
            </section>
            <section>
                <SearchResult />
            </section>
        </main>
    );
}