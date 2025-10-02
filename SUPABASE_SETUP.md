# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Fill in your project details:
   - Name: Your project name
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

Once your project is created:

1. Go to Settings > API
2. Copy your Project URL
3. Copy your anon/public key (not the service_role key)

## 3. Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## 4. Database Schema Setup

You can create tables for your hotel management app. Here are some suggested tables:

### Users Table (handled by Supabase Auth)

- Already created automatically

### Hotels Table

```sql
create table hotels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);
```

### Rooms Table

```sql
create table rooms (
  id uuid default uuid_generate_v4() primary key,
  room_number text not null,
  room_type text not null,
  location text not null,
  property_type text not null,
  bed_type text not null,
  max_occupancy integer not null,
  base_price decimal not null,
  currency text default 'USD',
  description text,
  amenities text[] default '{}',
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);
```

### Tour Guides Table

```sql
create table tour_guides (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  license_number text not null,
  phone text,
  email text,
  address text,
  commission_rate decimal default 0,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);
```

### Travel Agents Table

```sql
create table travel_agents (
  id uuid default uuid_generate_v4() primary key,
  agent_name text not null,
  agency_name text not null,
  phone text,
  email text,
  commission_rate decimal default 0,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);
```

## 5. Row Level Security (RLS)

Enable RLS for each table and create policies:

```sql
-- Enable RLS
alter table hotels enable row level security;
alter table rooms enable row level security;
alter table tour_guides enable row level security;
alter table travel_agents enable row level security;

-- Create policies (users can only access their own data)
create policy "Users can view own hotels" on hotels for select using (auth.uid() = user_id);
create policy "Users can insert own hotels" on hotels for insert with check (auth.uid() = user_id);
create policy "Users can update own hotels" on hotels for update using (auth.uid() = user_id);
create policy "Users can delete own hotels" on hotels for delete using (auth.uid() = user_id);

-- Repeat similar policies for other tables...
```

## 6. Usage in Your App

### Authentication

```typescript
import { useAuthContext } from "./contexts/AuthContext";

// In your component
const { user, loading, isAuthenticated } = useAuthContext();
```

### Database Operations

```typescript
import { DatabaseService } from "./lib/database";

// Insert a room
const result = await DatabaseService.insert("rooms", {
  room_number: "101",
  room_type: "Deluxe",
  // ... other fields
});

// Get all rooms
const { data: rooms } = await DatabaseService.getAll("rooms");
```

## 7. Testing

1. Start your Expo development server: `npm start`
2. Test the authentication flow
3. Verify database operations work correctly

## File Structure Created

```
lib/
├── supabase.ts          # Supabase client configuration
├── auth.ts              # Authentication helper functions
└── database.ts          # Database CRUD operations

hooks/
└── useAuth.ts           # Authentication hook

contexts/
└── AuthContext.tsx      # Authentication context provider

components/screens/
└── LoginScreen.tsx      # Example login screen
```

## Next Steps

1. Replace placeholder credentials in `.env`
2. Create your database schema in Supabase dashboard
3. Set up Row Level Security policies
4. Integrate authentication in your existing screens
5. Replace local state management with Supabase database operations
