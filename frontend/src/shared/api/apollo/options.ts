import { HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

export const httpLink = new HttpLink({
  // this needs to be an absolute url, as relative urls cannot be used in SSR
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',

  // you can disable result caching here if you want to
  // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
  credentials: 'include',
  // you can override the default `fetchOptions` on a per query basis
  // via the `context` property on the options passed as a second argument
  // to an Apollo Client data fetching hook, e.g.:
  // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
});

export const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();
  return {
    headers: {
      ...headers,
      'x-jwt': session?.accessToken || '',
    },
  };
});
