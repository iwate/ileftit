import NextAuth from 'next-auth';
import AADB2CProvider from 'next-auth/providers/azure-ad-b2c';
export const authOptions = {
  providers: [
    AADB2CProvider({
      tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: 'offline_access openid' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.uid = account.providerAccountId.replaceAll('-', '');
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.uid = token.uid;
      return session;
    },
  },
};
export default NextAuth(authOptions);
