import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AccountWithBalance } from '../lib/types';
import { useTenant } from './useTenant';

export function useAccounts() {
  const { tenant } = useTenant();
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async (isRefresh = false) => {
    if (!tenant?.id) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;

      // Map current_balance to currentBalance for component compatibility
      const accountsWithBalances: AccountWithBalance[] = (accountsData || []).map((account) => ({
        ...account,
        currentBalance: Number(account.current_balance),
      }));

      setAccounts(accountsWithBalances);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [tenant?.id]);

  const refreshAccounts = () => {
    fetchAccounts(true);
  };

  return {
    accounts,
    loading,
    error,
    refreshAccounts,
  };
}
