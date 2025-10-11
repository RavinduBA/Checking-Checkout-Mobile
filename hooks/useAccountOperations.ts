import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// hook for account delete no problems

export const useAccountOperations = () => {
  const deleteAccount = async (accountId: string, accountName: string) => {
    return new Promise<boolean>((resolve) => {
      // First check if account has any transfers
      const checkAndDelete = async () => {
        try {
          // Check for related transfers
          const { data: transfers, error: checkError } = await supabase
            .from('account_transfers')
            .select('id')
            .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
            .limit(1);

          if (checkError) {
            console.error('Error checking transfers:', checkError);
            Alert.alert('Error', 'Failed to check account transfers');
            resolve(false);
            return;
          }

          // If transfers exist, show warning and prevent deletion
          if (transfers && transfers.length > 0) {
            Alert.alert(
              'Cannot Delete Account',
              `"${accountName}" cannot be deleted because it has transfer history. Accounts with transactions cannot be removed to maintain financial record integrity.`,
              [
                {
                  text: 'OK',
                  onPress: () => resolve(false),
                }
              ]
            );
            return;
          }

          // Check for related income records
          const { data: income, error: incomeError } = await supabase
            .from('income')
            .select('id')
            .eq('account_id', accountId)
            .limit(1);

          if (incomeError) {
            console.error('Error checking income:', incomeError);
            Alert.alert('Error', 'Failed to check account records');
            resolve(false);
            return;
          }

          // Check for related expense records
          const { data: expenses, error: expenseError } = await supabase
            .from('expenses')
            .select('id')
            .eq('account_id', accountId)
            .limit(1);

          if (expenseError) {
            console.error('Error checking expenses:', expenseError);
            Alert.alert('Error', 'Failed to check account records');
            resolve(false);
            return;
          }

          // If income or expenses exist, prevent deletion
          if ((income && income.length > 0) || (expenses && expenses.length > 0)) {
            Alert.alert(
              'Cannot Delete Account',
              `"${accountName}" cannot be deleted because it has transaction history (income or expenses). Accounts with financial records cannot be removed.`,
              [
                {
                  text: 'OK',
                  onPress: () => resolve(false),
                }
              ]
            );
            return;
          }

          // If no related records, proceed with deletion
          const { error: deleteError } = await supabase
            .from('accounts')
            .delete()
            .eq('id', accountId);

          if (deleteError) {
            console.error('Error deleting account:', deleteError);
            Alert.alert('Error', 'Failed to delete account');
            resolve(false);
          } else {
            Alert.alert('Success', `"${accountName}" has been deleted successfully`);
            resolve(true);
          }

        } catch (err) {
          console.error('Error deleting account:', err);
          Alert.alert('Error', 'Failed to delete account');
          resolve(false);
        }
      };

      // Show confirmation dialog
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
            onPress: checkAndDelete,
          },
        ]
      );
    });
  };

  return {
    deleteAccount,
  };
};
