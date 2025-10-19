/**
 * Database Connection Test Script
 * Run this to verify your Supabase connection and reservations table
 */

import { supabase } from '../lib/supabase' // Adjust path to your supabase client

interface ConnectionTestResult {
  success: boolean
  totalReservations?: number
  sampleData?: any[]
  tableColumns?: string[]
  error?: any
}

export async function testDatabaseConnection(): Promise<ConnectionTestResult> {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test 1: Check connection with count query
    const { count, error: countError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Connection test failed:', countError)
      return { success: false, error: countError }
    }
    
    console.log('✅ Database connection successful!')
    console.log(`📊 Total reservations in database: ${count}`)
    
    // Test 2: Get sample data to verify table structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('reservations')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.error('⚠️ Sample data fetch failed:', sampleError)
      return { 
        success: true, 
        totalReservations: count || 0,
        error: sampleError 
      }
    }
    
    // Extract column names from sample data
    const tableColumns = sampleData && sampleData.length > 0 
      ? Object.keys(sampleData[0]) 
      : []
    
    console.log('✅ Sample data fetch successful!')
    console.log('📋 Table columns:', tableColumns)
    console.log('📄 Sample records:', sampleData)
    
    // Test 3: Check if we can perform basic operations
    console.log('🔍 Testing basic operations...')
    
    // Try to select with filters (this tests query capabilities)
    const { data: filteredData, error: filterError } = await supabase
      .from('reservations')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (filterError) {
      console.warn('⚠️ Filtered query test failed:', filterError)
    } else {
      console.log('✅ Filtered query test successful!')
    }
    
    return { 
      success: true, 
      totalReservations: count || 0,
      sampleData: sampleData || [],
      tableColumns
    }
    
  } catch (error) {
    console.error('💥 Database connection error:', error)
    return { success: false, error }
  }
}

// Helper function to test specific reservation operations
export async function testReservationOperations() {
  try {
    console.log('🧪 Testing reservation-specific operations...')
    
    // Test reading with joins if there are related tables
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:guest_id(*),
        room:room_id(*)
      `)
      .limit(1)
    
    if (error) {
      console.log('ℹ️ No foreign key relationships found or different schema')
      console.log('Error details:', error)
    } else {
      console.log('✅ Reservation with relationships:', data)
    }
    
    // Test date filtering (common for reservations)
    const { data: recentReservations, error: dateError } = await supabase
      .from('reservations')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
    
    if (dateError) {
      console.error('Date filtering test failed:', dateError)
    } else {
      console.log(`✅ Found ${recentReservations?.length || 0} reservations from last 7 days`)
    }
    
  } catch (error) {
    console.error('Reservation operations test error:', error)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(result => {
      console.log('\n📋 Test Summary:')
      console.log('Success:', result.success)
      console.log('Total Reservations:', result.totalReservations)
      console.log('Table Columns:', result.tableColumns)
      
      if (result.success) {
        return testReservationOperations()
      }
    })
    .catch(console.error)
}
