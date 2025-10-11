import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// hook for account delete no problems

export const useAccountOperations = () => {
  const deleteAccount = async (accountId: string, accountName: string) => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Delete Account',
        `Are you sure you want to delete "${accountName}"? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('accounts')
                  .delete()
                  .eq('id', accountId);

                if (error) {
                  console.error('Error deleting account:', error);
                  Alert.alert('Error', 'Failed to delete account');
                  resolve(false);
                } else {
                  resolve(true);
                }
              } catch (err) {
                console.error('Error deleting account:', err);
                Alert.alert('Error', 'Failed to delete account');
                resolve(false);
              }
            },
          },
        ]
      );
    });
  };

  return {
    deleteAccount,
  };
};
