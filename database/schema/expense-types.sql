-- Create expense_types table for the expense categories feature
-- This table stores the main types and sub types of expenses

CREATE TABLE IF NOT EXISTS public.expense_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    main_type TEXT NOT NULL,
    sub_type TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expense_types_tenant_id ON public.expense_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expense_types_main_type ON public.expense_types(main_type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view expense types in their tenant" ON public.expense_types;
CREATE POLICY "Users can view expense types in their tenant" ON public.expense_types
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert expense types in their tenant" ON public.expense_types;
CREATE POLICY "Users can insert expense types in their tenant" ON public.expense_types
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update expense types in their tenant" ON public.expense_types;
CREATE POLICY "Users can update expense types in their tenant" ON public.expense_types
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete expense types in their tenant" ON public.expense_types;
CREATE POLICY "Users can delete expense types in their tenant" ON public.expense_types
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Insert some default expense types for testing (optional)
INSERT INTO public.expense_types (main_type, sub_type) VALUES 
    ('Utilities', 'Electricity'),
    ('Utilities', 'Water'),
    ('Utilities', 'Internet'),
    ('Maintenance', 'Cleaning'),
    ('Maintenance', 'Repairs'),
    ('Marketing', 'Online Advertising'),
    ('Marketing', 'Print Materials'),
    ('Staff', 'Salaries'),
    ('Staff', 'Benefits')
ON CONFLICT DO NOTHING;
