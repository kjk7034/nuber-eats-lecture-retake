'use client';

import {
  CreateAccountMutation,
  CreateAccountMutationVariables,
  UserRole,
} from '@/graphql/__generated__/graphql';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';

import { gql, useMutation } from '@apollo/client';
import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export const metadata: Metadata = {
  title: 'Create Account | Nuber Eats',
};

const CREATE_ACCOUNT_MUTATION = gql`
  mutation createAccount($createAccountInput: CreateAccountInput!) {
    createAccount(input: $createAccountInput) {
      ok
      error
    }
  }
`;

interface ICreateAccountForm {
  email: string;
  password: string;
  role: UserRole;
}

export default function CreateAccountForm() {
  const router = useRouter();
  const {
    register,
    getValues,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ICreateAccountForm>({
    mode: 'onChange',
    defaultValues: {
      role: UserRole.Client,
    },
  });

  const onCompleted = (data: CreateAccountMutation) => {
    const {
      createAccount: { ok },
    } = data;
    if (ok) {
      router.push('/login');
    }
  };

  const [
    createAccountMutation,
    { loading, data: createAccountMutationResult },
  ] = useMutation<CreateAccountMutation, CreateAccountMutationVariables>(
    CREATE_ACCOUNT_MUTATION,
    {
      onCompleted,
    },
  );

  const onSubmit = () => {
    if (!loading) {
      const { email, password, role } = getValues();
      createAccountMutation({
        variables: {
          createAccountInput: { email, password, role },
        },
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 mt-5 w-full mb-5"
    >
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
      {errors.email?.type === 'pattern' && (
        <FormError errorMessage={'Please enter a valid email'} />
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
      {errors.password?.type === 'minLength' && (
        <FormError errorMessage="Password must be more than 10 chars." />
      )}
      <select {...register('role', { required: true })} className="input">
        {Object.keys(UserRole).map((role, index) => (
          <option key={index}>{role}</option>
        ))}
      </select>
      <Button
        canClick={isValid}
        loading={loading}
        actionText={'Create Account'}
      />
      {createAccountMutationResult?.createAccount.error && (
        <FormError
          errorMessage={createAccountMutationResult.createAccount.error}
        />
      )}
    </form>
  );
}
