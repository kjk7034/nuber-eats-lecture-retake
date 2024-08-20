import LoginForm from '@/features/auth/login/LoginForm';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login | Nuber Eats',
};

export default function Login() {
  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h3 className="w-full font-medium text-center text-5xl mb-5">
          Uber <span className="text-lime-500">Eats</span>
        </h3>

        <h4 className="w-full font-medium text-left text-3xl mb-5">
          Welcome back
        </h4>
        <LoginForm />
        <div>
          New to Nuber?{' '}
          <Link
            href={'/create-account'}
            className="text-lime-600 hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
