import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase-types'
import { Database as DatabaseInternal } from '@/types/supabase-internal-types'

const supabaseUrl = "https://db.wikisubmission.org";

export const supabase = () => createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const supabaseInternal = () => createClient<DatabaseInternal>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    db: {
        schema: "internal"
    }
})