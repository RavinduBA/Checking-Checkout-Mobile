import { supabase } from './supabase';

/**
 * Creates a profile record for the current authenticated user if one doesn't exist
 * This is useful for handling existing users who registered before the profile trigger was added
 */
export async function ensureUserProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('No authenticated user found');
    }

    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile exists, return success
    if (existingProfile && !profileError) {
      return { success: true, profile: existingProfile };
    }

    // If profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split('@')[0],
        tenant_role: 'tenant_admin',
        is_tenant_admin: false,
        first_login_completed: false,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return { success: true, profile: newProfile };
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return { success: false, error };
  }
}

/**
 * Gets the current user's profile, creating one if it doesn't exist
 */
export async function getUserProfileWithFallback() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'No authenticated user found' };
    }

    // Try to get existing profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If profile exists, return it
    if (profile && !profileError) {
      return { success: true, profile };
    }

    // If profile doesn't exist, try to create it
    const ensureResult = await ensureUserProfile();
    if (!ensureResult.success) {
      return ensureResult;
    }

    // Fetch the newly created profile with full data
    const { data: newProfile, error: newProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (newProfileError) {
      return { success: false, error: newProfileError };
    }

    return { success: true, profile: newProfile };
  } catch (error) {
    console.error('Error getting user profile with fallback:', error);
    return { success: false, error };
  }
}
