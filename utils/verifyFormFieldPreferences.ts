import { supabase } from '../lib/supabase';

export const verifyFormFieldPreferences = async (tenantId: string) => {
  console.log('=== VERIFYING FORM FIELD PREFERENCES ===');
  console.log('Tenant ID:', tenantId);
  
  try {
    // Fetch current preferences directly from database
    const { data, error } = await supabase
      .from('form_field_preferences')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
    
    console.log('Current preferences in database:');
    console.log(JSON.stringify(data, null, 2));
    
    return data;
    
  } catch (err) {
    console.error('Verification failed:', err);
    return null;
  }
};

// Function to manually test an update
export const testPreferenceUpdate = async (tenantId: string, updates: any) => {
  console.log('=== TESTING PREFERENCE UPDATE ===');
  console.log('Tenant ID:', tenantId);
  console.log('Updates:', JSON.stringify(updates, null, 2));
  
  try {
    // First get the current record
    const { data: current, error: fetchError } = await supabase
      .from('form_field_preferences')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current preferences:', fetchError);
      return false;
    }
    
    console.log('Current record:', JSON.stringify(current, null, 2));
    
    // Now try to update
    const { data: updated, error: updateError } = await supabase
      .from('form_field_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', current.id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return false;
    }
    
    console.log('Updated record:', JSON.stringify(updated, null, 2));
    return true;
    
  } catch (err) {
    console.error('Test update failed:', err);
    return false;
  }
};
