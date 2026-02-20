import { QueryResultSearch } from 'wikisubmission-sdk/lib/quran/v1/query-result'

export function SearchItemTitle({
  props,
}: {
  props: { results: QueryResultSearch }
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">
        {props.results.metadata.formattedQuery}
      </h2>
    </div>
  )
}
