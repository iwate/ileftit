import { SessionProvider, useSession } from 'next-auth/react';
import { themeFont } from '../utils/fonts';
import "../styles/reset.css"
import "../styles/main.css"
import { useRouter } from 'next/router';
import Link from 'next/link';

function Footer() {
  const { data: session } = useSession();
  return <footer>
    <ul>
      <li>&copy;2023 'I left it'</li>
      <li><Link href="/tos/">Term of Service</Link></li>
      <li><Link href="/privacy/">Privacy policy</Link></li>
    </ul>
    {session?.user&&<ul>
      <li><Link href="/api/auth/logout">Sign out</Link></li>
      <li><Link href="/api/auth/password'">Change Password</Link></li>
      <li><Link href="/api/auth/quit'">Quit Account</Link></li>
    </ul>}
  </footer>
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const router = useRouter();
  const href = router.route.startsWith('/wills') ? '/wills' : '/';
  return (
    <SessionProvider session={session}>
      <header><Link href={href} className={`${themeFont.className}`}>I left it</Link></header>
      <Component {...pageProps} />
      <Footer/>
    </SessionProvider>
  );
}
