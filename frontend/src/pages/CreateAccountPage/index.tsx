import CreateAccountForm from '@/features/auth/createAccount/CreateAccountForm';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account | Nuber Eats',
};

export default function CreateAccount() {
  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h3 className="w-full font-medium text-center text-5xl mb-5">
          Uber <span className="text-lime-500">Eats</span>
        </h3>
        <h4 className="w-full font-medium text-left text-3xl mb-5">
          Let&apos;s get started
        </h4>
        <CreateAccountForm />
        <div>
          Already have an account?{' '}
          <Link href="/login" className="text-lime-600 hover:underline">
            Log in now
          </Link>
        </div>
      </div>
    </div>
  );
}
