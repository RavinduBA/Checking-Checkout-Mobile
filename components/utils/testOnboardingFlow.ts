// Test utility to check onboarding flow status
import { supabase } from '../../lib/supabase';

export interface OnboardingStatus {
  hasProfile: boolean;
  hasTenant: boolean;
  needsOnboarding: boolean;
  profileData?: any;
  tenantData?: any;
}

export async function checkOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  try {
    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    const hasProfile = !!profile;
    const hasTenant = hasProfile && profile.tenant_id !== null;

    let tenantData = null;
    if (hasTenant && profile.tenant_id) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();
      tenantData = tenant;
    }

    return {
      hasProfile,
      hasTenant,
      needsOnboarding: !hasTenant,
      profileData: profile,
      tenantData,
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw error;
  }
}

export async function resetUserForOnboarding(userId: string): Promise<void> {
  try {
    // Reset profile to remove tenant_id and first_login_completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        tenant_id: null,
        first_login_completed: false,
        is_tenant_admin: false,
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    console.log('User reset for onboarding testing');
  } catch (error) {
    console.error('Error resetting user:', error);
    throw error;
  }
}

export async function createTestOnboardingData(): Promise<void> {
  // This could be used to create test data for onboarding
  console.log('Test onboarding data creation placeholder');
}
