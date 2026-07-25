import type { AuthMode, LoginFormValues } from '../types';

export function validateLoginForm(mode: AuthMode, values: LoginFormValues): string | null {
  if (!values.email || !values.password || (mode === 'signup' && !values.fullName)) {
    return 'Vui lòng điền đầy đủ các thông tin cần thiết.';
  }

  return null;
}
