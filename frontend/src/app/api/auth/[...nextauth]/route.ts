import { getClient } from '@/shared/api/apollo/client';
import { gql } from '@apollo/client';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const LOGIN_MUTATION = gql`
  mutation login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      ok
      token
      error
    }
  }
`;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const { data } = await getClient().mutate({
            mutation: LOGIN_MUTATION,
            variables: {
              email: credentials.email,
              password: credentials.password,
            },
          });

          if (data?.login?.ok && data?.login?.token) {
            console.log('Login successful');
            return {
              id: credentials.email,
              email: credentials.email,
              token: data.login.token,
            };
          } else {
            throw new Error(data?.login?.error || 'Login failed');
          }
        } catch (error: any) {
          console.error('Login error:', error);
          if (error.networkError) {
            console.error('Network error details:', error.networkError);
            throw new Error('Network error occurred');
          }
          if (error.graphQLErrors) {
            console.error('GraphQL errors:', error.graphQLErrors);
            throw new Error(
              error.graphQLErrors[0]?.message || 'GraphQL error occurred',
            );
          }
          throw error; // 기타 예상치 못한 오류 발생 시
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

// 추가적인 토큰 검증 함수
async function validateToken(token: string): Promise<boolean> {
  console.log('token', token);
  // 여기에 토큰 검증 로직을 구현합니다.
  // 예: JWT 디코딩, 서명 확인, 만료 시간 확인 등
  // 실제 구현은 사용하는 토큰 형식과 보안 요구사항에 따라 달라집니다.
  return true; // 임시 반환값, 실제로는 검증 결과를 반환해야 합니다.
}

export const { signIn, signOut } = handler;

export { handler as GET, handler as POST };
