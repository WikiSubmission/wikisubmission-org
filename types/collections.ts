export interface CollectionData {
  id: number
  name: string
  description: string
  is_public: boolean
  share_token?: string
  created_at: string
  updated_at: string
}

export interface CollectionVerseData {
  id: number
  collection_id: number
  scripture: string
  verse_key: string
  note: string
  position: number
  created_at: string
}

export interface CollectionDetail extends CollectionData {
  verses: CollectionVerseData[]
}
