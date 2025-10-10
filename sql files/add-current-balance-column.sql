-- Add missing current_balance column to accounts table
-- This column is needed to track the current balance of each account

DO $$ 
BEGIN
    -- Check if current_balance column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' 
        AND column_name = 'current_balance'
        AND table_schema = 'public'
    ) THEN
        -- Add current_balance column
        ALTER TABLE public.accounts 
        ADD COLUMN current_balance numeric NOT NULL DEFAULT 0;
        
        -- Update existing accounts to set current_balance equal to initial_balance
        UPDATE public.accounts 
        SET current_balance = initial_balance;
        
        RAISE NOTICE 'Added current_balance column to accounts table and initialized with initial_balance values';
    ELSE
        RAISE NOTICE 'current_balance column already exists in accounts table';
    END IF;
END $$;
