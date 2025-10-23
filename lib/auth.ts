import { Alert } from 'react-native';
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Async function to create a new user with email and password.
export const signUp = async (email: string, password: string, fullName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      return { success: false, error };
    }

    // Since email confirmation is disabled, user is immediately logged in
    if (data?.user && data?.session) {
      console.log('Registration successful, user authenticated');
      
      Alert.alert(
        'Registration Successful!', 
        'Your account has been created and you are now signed in. Welcome!',
        [{ text: 'OK' }]
      );
    }

    return { success: true, data };
  } catch (error) {
    Alert.alert('Sign Up Error', 'An unexpected error occurred');
    return { success: false, error };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Sign In Error', error.message);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    Alert.alert('Sign In Error', 'An unexpected error occurred');
    return { success: false, error };
  }
};

// Sign out
export const signOut = async () => {
  try {
    // Use 'local' scope to properly clear session from AsyncStorage/localStorage
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    
    if (error) {
      Alert.alert('Sign Out Error', error.message);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    Alert.alert('Sign Out Error', 'An unexpected error occurred');
    return { success: false, error };
  }
};

// Fetches the currently logged-in user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { success: false, error };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      Alert.alert('Reset Password Error', error.message);
      return { success: false, error };
    }

    Alert.alert('Password Reset', 'Check your email for password reset instructions');
    return { success: true };
  } catch (error) {
    Alert.alert('Reset Password Error', 'An unexpected error occurred');
    return { success: false, error };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
