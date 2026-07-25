import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { DEMO_PASSWORD } from '../constants';
import type { AuthMode, DemoAccount, LoginFormValues } from '../types';
import { validateLoginForm } from '../services/loginValidationService';

export function useLoginPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [mode, setMode] = useState<AuthMode>('login');
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    fullName: '',
    role: 'bride',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const updateValue = <Key extends keyof LoginFormValues>(key: Key, value: LoginFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  };

  const completeAuth = () => {
    setSuccess(true);
    window.setTimeout(() => {
      navigate(redirectPath);
    }, 500);
  };

  const handleDemoLogin = async (account: DemoAccount) => {
    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(account.email, DEMO_PASSWORD);

    if (signInError) {
      setError('Không thể đăng nhập tài khoản demo. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    completeAuth();
    setLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateLoginForm(mode, values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: authError } = mode === 'login'
        ? await signIn(values.email, values.password)
        : await signUp(values.email, values.password, values.fullName, values.role);

      if (authError) {
        setError(authError);
        return;
      }

      completeAuth();
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    handleDemoLogin,
    handleSubmit,
    loading,
    mode,
    selectMode,
    success,
    updateValue,
    values,
  };
}
