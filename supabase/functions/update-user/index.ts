import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { user_id, email, password, full_name, last_name, cedula, phone, role } = await req.json()

        if (!user_id) throw new Error('user_id is required')

        // 1. Update Auth User (Email/Password)
        const authUpdates: any = {
            user_metadata: {
                full_name: `${full_name} ${last_name}`
            }
        }
        if (email) authUpdates.email = email
        if (password) authUpdates.password = password
        // If updating email, Supabase might send a confirmation by default depending on settings.
        // using admin.updateUserById usually skips confirmation checks if email_confirm is not involved, 
        // effectively changing it immediately.

        const { data: user, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            user_id,
            authUpdates
        )

        if (authError) throw authError

        // 2. Update Public Profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: full_name,
                last_name: last_name,
                cedula: cedula,
                phone: phone,
                role: role,
                email: email // Keep profile email in sync
            })
            .eq('id', user_id)

        if (profileError) throw profileError

        return new Response(
            JSON.stringify(user),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
