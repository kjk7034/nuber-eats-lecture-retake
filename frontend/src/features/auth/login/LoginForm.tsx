'use client';

import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ILoginForm {
  email: string;
  password: string;
}

interface ILoginState {
  loading: boolean;
  error: string | null;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [loginState, setLoginState] = useState<ILoginState>({
    loading: false,
    error: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ILoginForm>({
    mode: 'onChange',
  });

  const onSubmit = async (formData: ILoginForm) => {
    try {
      setLoginState({ loading: true, error: null });
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setLoginState({ loading: false, error: result.error });
      } else {
        router.push(callbackUrl); // 로그인 성공 시 홈페이지로 리다이렉트
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginState({ loading: false, error: 'An unexpected error occurred' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 mt-5 w-full">
      <input
        {...register('email', {
          required: 'Email is required',
          pattern:
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        })}
        type="email"
        placeholder="Email"
        className="input"
      />
      {errors.email?.message && (
        <FormError errorMessage={errors.email?.message} />
      )}
      <input
        {...register('password', {
          required: 'Password is required',
        })}
        type="password"
        placeholder="Password"
        className="input"
      />
      {errors.password?.message && (
        <FormError errorMessage={errors.password?.message} />
      )}
      <Button
        canClick={isValid}
        loading={loginState.loading}
        actionText={'Log in'}
      />
      {loginState.error && <FormError errorMessage={loginState.error} />}
    </form>
  );
}
