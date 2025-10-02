# Database Schema Setup Instructions

## How to Run the Database Schema in Supabase

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**

   - Go to [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Navigate to SQL Editor**

   - Click on "SQL Editor" in the left sidebar
   - Click on "New Query"

3. **Copy and paste the schema**

   - Open the `database-schema.sql` file in this project
   - Copy all the content (Ctrl+A, then Ctrl+C)
   - Paste it into the SQL Editor in Supabase

4. **Run the script**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for the script to execute completely
   - You should see "Database schema created successfully!" message at the end

### Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link your project (replace your-project-ref with your actual project reference)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## What This Schema Creates

### Custom Types (Enums)

- `currency_type`: USD, EUR, GBP, LKR, INR, AUD, CAD, JPY, SGD
- `booking_status`: pending, confirmed, checked_in, checked_out, cancelled, no_show
- `booking_source`: direct, airbnb, booking_com, expedia, etc.
- `income_type`: booking, extra_service, deposit, other
- `user_role`: super_admin, admin, manager, staff
- `tenant_role`: tenant_owner, tenant_admin, tenant_manager, tenant_staff
- `reservation_status`: tentative, confirmed, checked_in, checked_out, cancelled, no_show

### Main Tables Created

1. **tenants** - Multi-tenant support
2. **profiles** - User profiles
3. **locations** - Hotel locations
4. **rooms** - Room management
5. **accounts** - Financial accounts
6. **guides** - Tour guides
7. **agents** - Travel agents
8. **reservations** - Booking reservations
9. **payments** - Payment tracking
10. **expenses** - Expense management
11. **income** - Income tracking
12. And many more supporting tables...

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Basic policies created for profiles table
- Foreign key constraints for data integrity
- Check constraints for data validation

## After Running the Schema

1. **Verify the tables were created**

   - Go to "Table Editor" in your Supabase dashboard
   - You should see all the tables listed

2. **Set up additional RLS policies**

   - The schema includes basic RLS policies
   - You may need to create additional policies based on your business requirements

3. **Update your app's database types**
   - You can generate TypeScript types from your Supabase schema
   - Use the Supabase CLI: `supabase gen types typescript --local > database.types.ts`

## Troubleshooting

### If you get errors:

1. **Permission errors**: Make sure you're running this as the database owner
2. **Type already exists**: The script handles this with `IF NOT EXISTS` checks
3. **Foreign key errors**: Make sure you're running the complete script in order

### If tables already exist:

- The script uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing data
- If you need to recreate tables, you'll need to drop them first (be careful with data loss!)

## Integration with Your React Native App

After the schema is created, you can:

1. **Update your database helper functions** in `lib/database.ts`
2. **Create specific service functions** for each entity (rooms, guides, agents, etc.)
3. **Set up proper RLS policies** for your multi-tenant architecture
4. **Generate TypeScript types** for better type safety

The schema is now ready to support your hotel management application with all the features you've built in your React Native app!
