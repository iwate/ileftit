// [...nextauth].ts
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import AADB2CProvider from 'next-auth/providers/azure-ad-b2c';
import jwtDecode from 'jwt-decode';

export default (req: NextApiRequest, res: NextApiResponse) => {
  // ...
  const b2cProviderName = 'azure-ad-b2c';
  const clientId = process.env.AZURE_AD_B2C_CLIENT_ID;
  const tenantName = process.env.AZURE_AD_B2C_TENANT_NAME;
  let userFlow = process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW; // flow used by default
  const b2cPasswordResetFlow = process.env.AZURE_AD_B2C_PASSWORD_RESET_USER_FLOW;

  // #region Handle Azure B2C callbacks

  // https://docs.microsoft.com/en-us/azure/active-directory-b2c/error-codes
  const b2cPasswordResetErrorCode = 'AADB2C90118'; // error_description: 'AADB2C90118: The user has forgotten their password.\r\n'
  const b2cPasswordResetCancelErrorCode = 'AADB2C90091'; // error_description: 'AADB2C90091: The user has cancelled entering self-asserted information.\r\n'

  console.log('Hello');
  console.log(req.method, req.url, req.body);
  if (req.method === 'GET' && req.url.startsWith(`/api/auth/callback/${b2cProviderName}/`)) {
    console.log(`Azure B2C callback:`, req.method, req.url, {
      query: req.query,
      body: req.body,
    });

    if (
      req.query?.error === 'access_denied' &&
      req.query?.error_description?.indexOf(b2cPasswordResetErrorCode) !== -1
    ) {
      console.log(
        'Detected Azure B2C password reset error callback. Code:',
        b2cPasswordResetErrorCode
      );
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/${b2cProviderName}/`;
      let b2cPasswordResetFlowUrl =
        `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${b2cPasswordResetFlow}/oauth2/v2.0/authorize?
          response_type=code
          &scope=offline_access%20openid
          &redirect_uri=${encodeURIComponent(redirectUri)}
          &client_id=${clientId}`
          .replace(/ /g, '')
          .replace(/\n/g, '')
          .replace(/\r\n/g, '');

      console.log('Redirecting to B2C password reset flow:', b2cPasswordResetFlowUrl);
      return res.redirect(b2cPasswordResetFlowUrl);
    }
    // handle cancel clicked during password reset
    else if (
      req.query?.error === 'access_denied' &&
      req.query?.error_description?.indexOf(b2cPasswordResetCancelErrorCode) !== -1
    ) {
      console.log(
        'Detected Azure B2C password reset cancel error callback. Code:',
        b2cPasswordResetCancelErrorCode
      );
      return res.redirect(process.env.NEXTAUTH_URL);
    }
  }

  // #endregion

  const options: NextAuthOptions = {
    // ...
    providers: [
      AADB2CProvider({
        tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
        clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
        primaryUserFlow: userFlow,
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
        (session.user as any).uid = token.uid;
        return session;
      },
    },
  };

  return NextAuth(req, res, options);
}

// import NextAuth from 'next-auth';
// export const authOptions = {
//   providers: [
//     AADB2CProvider({
//       tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
//       clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
//       clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
//       primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
//       authorization: { params: { scope: 'offline_access openid' } },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, account }) {
//       if (account) {
//         token.uid = account.providerAccountId.replaceAll('-', '');
//         token.idToken = account.id_token;
//       }
//       return token;
//     },
//     async session({ session, token, user }) {
//       session.user.uid = token.uid;
//       return session;
//     },
//   },
// };
// // export default NextAuth(authOptions);
