-- Comprehensive accounts table update to match web app schema
-- This ensures the mobile app database schema matches the web app

DO $$ 
BEGIN
    -- Add current_balance column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' 
        AND column_name = 'current_balance'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.accounts 
        ADD COLUMN current_balance numeric NOT NULL DEFAULT 0;
        
        -- Initialize current_balance with initial_balance for existing accounts
        UPDATE public.accounts 
        SET current_balance = initial_balance;
        
        RAISE NOTICE 'Added current_balance column to accounts table';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.accounts 
        ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        
        RAISE NOTICE 'Added updated_at column to accounts table';
    END IF;

    -- Create trigger to automatically update updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_updated_at_accounts'
    ) THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER set_updated_at_accounts
            BEFORE UPDATE ON public.accounts
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Created updated_at trigger for accounts table';
    END IF;

END $$;
