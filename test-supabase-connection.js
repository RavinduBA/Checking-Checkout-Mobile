// Test Supabase database connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xionntdjhfggumpwvjvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpb25udGRqaGZnZ3VtcHd2anZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDU1NzgsImV4cCI6MjA3NDk4MTU3OH0.RjdElkTRSFPUM32KyT-5VQyvSpP4qF78gOoIU-WnTVQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Basic connection test
    console.log('\n1. Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('reservations')
      .select('count(*)', { count: 'exact', head: true });
    
    if (healthError) {
      console.log('❌ Basic connection failed:', healthError.message);
      console.log('   Error details:', JSON.stringify(healthError, null, 2));
    } else {
      console.log('✅ Basic connection successful');
      console.log('   Total reservations count:', healthCheck);
    }

    // Test 2: Schema inspection
    console.log('\n2. Testing reservations table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('reservations')
      .select('*')
      .limit(0);
    
    if (schemaError) {
      console.log('❌ Schema inspection failed:', schemaError.message);
    } else {
      console.log('✅ Schema accessible');
    }

    // Test 3: Sample data query
    console.log('\n3. Testing sample data query...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('reservations')
      .select('id, created_at, status')
      .limit(3);
    
    if (sampleError) {
      console.log('❌ Sample query failed:', sampleError.message);
      console.log('   Error details:', JSON.stringify(sampleError, null, 2));
    } else {
      console.log('✅ Sample query successful');
      console.log('   Sample data:', JSON.stringify(sampleData, null, 2));
    }

    // Test 4: List all available tables
    console.log('\n4. Testing available tables query...');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_schema_tables');
    
    if (tablesError) {
      console.log('❌ Tables listing failed:', tablesError.message);
      // Fallback: try a simple query to see what tables exist
      console.log('   Trying fallback method...');
      
      const tables = ['tenants', 'profiles', 'locations', 'rooms', 'reservations', 'bookings'];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(0);
          if (!error) {
            console.log(`   ✅ Table '${table}' exists and accessible`);
          }
        } catch (e) {
          console.log(`   ❌ Table '${table}' not accessible`);
        }
      }
    } else {
      console.log('✅ Tables listing successful');
      console.log('   Available tables:', tablesData);
    }

  } catch (error) {
    console.log('💥 Unexpected error:', error);
  }
}

testConnection();
