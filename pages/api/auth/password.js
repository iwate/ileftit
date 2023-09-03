import { getToken } from "next-auth/jwt"

const endsessionURL = `https://${process.env.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/authorize`
const postLogoutUrl = `${process.env.NEXTAUTH_URL}/wills`;

export default async function changePassword(req, res) {
  const endsessionParams = new URLSearchParams({
    p: process.env.AZURE_AD_B2C_PASSWORD_CHANGE_USER_FLOW,
    client_id: process.env.AZURE_AD_B2C_CLIENT_ID,
    redirect_uri: postLogoutUrl,
    nonce: 'defaultNonce',
    scope:'openid',
    response_type:'code',
    prompt:'login'
  })
  return res.redirect(`${endsessionURL}?${endsessionParams}`)
}