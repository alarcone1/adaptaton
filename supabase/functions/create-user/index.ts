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

        const { email, password, full_name, last_name, cedula, phone, role } = await req.json()

        // 1. Create User (Unconfirmed by default if email_confirm is false, but explicit is better)
        // We set email_confirm: false to ensure they must validate.
        const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: {
                full_name: `${full_name} ${last_name}`
            }
        })

        if (createError) throw createError

        // 2. Update Profile with specific data (Role, Cedula, Phone)
        // The trigger might have created it as 'student'. We override it.
        if (user.user) {
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    role: role,
                    cedula: cedula,
                    phone: phone,
                    last_name: last_name,
                    // Ensure full_name is sync
                    full_name: `${full_name} ${last_name}`
                })
                .eq('id', user.user.id)

            if (updateError) throw updateError

            // 3. Trigger Confirmation Email manually since createUser might not send it by default with admin api
            // using auth.resend usually works for sending specific emails.
            // Or we can rely on Supabase sending it if we use standard signUp? No, signUp logs us in.
            // But verify: Admin API createUser *without* email_confirm:true usually sends the invite?
            // Actually, docs say "If email_confirm is false, the user will be created but not confirmed."
            // It does NOT say "and an email will be sent".
            // To send email, we might need inviteUserByEmail, but that doesn't set password.
            // So we use resend.
            await supabaseAdmin.auth.resend({
                type: 'signup',
                email: email,
            })
        }

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
