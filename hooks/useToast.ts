import { Alert } from 'react-native';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
    if (variant === 'destructive') {
      Alert.alert('Error', description || title);
    } else {
      Alert.alert(title, description);
    }
  };

  return { toast };
};
