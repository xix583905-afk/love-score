import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xautadstdexqgpahfdpv.supabase.co";

const supabaseKey = "sb_publishable_lOpeSKp94CZvg3uzoXzCmw_Ewk33DIF";

export const supabase = createClient(supabaseUrl, supabaseKey);