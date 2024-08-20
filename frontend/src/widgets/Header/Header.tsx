'use client';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React, { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const hideHeaderPaths = ['/login', '/create-account'];

const Header: React.FC = () => {
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    signOut({
      callbackUrl: '/',
    });
  }, []);
  // Header를 표시할지 여부 결정
  const showHeader = !hideHeaderPaths.includes(pathname);

  if (!showHeader) return;
  return (
    <header className="py-4">
      <div className="w-full px-5 xl:px-0 max-w-screen-xl mx-auto flex justify-between items-center">
        <h3 className="w-full font-medium text-center text-5xl mb-5">
          Uber <span className="text-lime-500">Eats</span>
        </h3>
        <span className="text-xs">
          <Link href="/my-profile">
            <FontAwesomeIcon icon={faUser} className="text-xl" />
          </Link>
        </span>
        <span className="text-xs ml-5">
          <button type="button" className="btn w-40" onClick={handleClick}>
            로그아웃
          </button>
        </span>
      </div>
    </header>
  );
};
export default Header;
