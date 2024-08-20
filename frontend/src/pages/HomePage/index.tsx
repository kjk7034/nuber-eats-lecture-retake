'use client';

import { useMe } from '@/entities/user/api/useMe';
import ClientRestaurants from '@/features/restaurants/ClientRestaurants';
import { UserRole } from '@/graphql/__generated__/graphql';

export default function HomePage() {
  const { data, loading, error } = useMe();
  if (!data || loading || error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <span className="font-medium text-xl tracking-wide">Loading...</span>
      </div>
    );
  }
  return <>{data.me.role === UserRole.Client && <ClientRestaurants />}</>;
}
