-- Seed Test Users via SQL
-- Needs pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Helper function to create user if not exists
CREATE OR REPLACE FUNCTION public.create_test_user(
    param_email text, 
    param_password text, 
    param_role user_role
)
RETURNS void AS $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO new_user_id FROM auth.users WHERE email = param_email;

    IF new_user_id IS NULL THEN
        -- Create new user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', -- Default instance_id
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            param_email,
            crypt(param_password, gen_salt('bf')), -- Hash password
            now(), -- Auto confirm
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('full_name', 'Test ' || initcap(param_role::text)),
            now(),
            now()
        ) RETURNING id INTO new_user_id;

        -- Create identity
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id, -- REQUIRED: usually the email for email provider
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(), -- Identity ID
            new_user_id,
            jsonb_build_object('sub', new_user_id, 'email', param_email),
            'email',
            param_email, -- Set provider_id to email
            now(),
            now(),
            now()
        );
    END IF;

    -- Ensure profile exists and has correct role
    -- Upsert profile
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new_user_id, 
        'Test ' || initcap(param_role::text),
        param_role
    )
    ON CONFLICT (id) DO UPDATE
    SET role = param_role; -- Force role update just in case

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Execute creation for all roles
SELECT public.create_test_user('admin@adaptaton.com', 'password123', 'admin');
SELECT public.create_test_user('student@adaptaton.com', 'password123', 'student');
SELECT public.create_test_user('teacher@adaptaton.com', 'password123', 'teacher');
SELECT public.create_test_user('partner@adaptaton.com', 'password123', 'partner');
