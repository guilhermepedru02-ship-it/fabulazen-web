import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://auhamseeqdpoatwnyxwl.supabase.co'
const supabaseKey = 'sb_publishable_3107xwGQfXogGI_dQlTi0w_ROoVcxAG'

export const supabase = createClient(supabaseUrl, supabaseKey)
