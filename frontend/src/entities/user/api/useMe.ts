import { MeQuery } from '@/graphql/__generated__/graphql';
import { gql, useQuery } from '@apollo/client';

const ME_QUERY = gql`
  query me {
    me {
      id
      email
      role
      verified
    }
  }
`;

export const useMe = () => {
  return useQuery<MeQuery>(ME_QUERY);
};
