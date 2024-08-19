'use client';

import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '../lib/apollo-client';
import { useMemo } from 'react';

export default function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(() => createApolloClient(), []);
  console.log('client', client);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
