import { getToken } from "next-auth/jwt"

const endsessionURL = `https://${process.env.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/logout`
const postLogoutUrl = `${process.env.NEXTAUTH_URL}/api/auth/signout`;

export default async function preLogout(req, res) {
  try {
    const token = await getToken({ req })
    if (!token) {
      console.warn("No JWT token found when calling /federated-logout endpoint")
      return res.redirect(postLogoutUrl)
    }
    if (!token.idToken)
        console.warn("Without an id_token the user won't be redirected back from the IdP after logout.")

    const endsessionParams = new URLSearchParams({
      id_token_hint: token.idToken,
      post_logout_redirect_uri: postLogoutUrl,
    })
    return res.redirect(`${endsessionURL}?${endsessionParams}`)
  } catch (error) {
    console.error(error)
    res.redirect(postLogoutUrl)
  }
}