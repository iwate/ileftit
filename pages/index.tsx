import { signIn } from 'next-auth/react';
import { Button } from '../components/Button';

export default function Home() {
  return (
    <main id="lp">
      <hgroup>
        <h1>
          Securely Preserve Your Secrets with &apos;I left it&apos; <br />– Your
          Private Data Vault
        </h1>
        <Button
          onClick={() =>
            signIn('azure-ad-b2c', {
              callbackUrl: '/wills/',
            })
          }
        >
          Sign up / Sign in
        </Button>
      </hgroup>
      <section>
        <p>
          Welcome to &apos;I left it,&apos; the ultimate web service for
          safeguarding your confidential text data. Our cutting-edge platform
          empowers you to store your sensitive information securely, putting you
          in control of your digital privacy.
        </p>
      </section>
      <section>
        <h2 id="key-features">Key Features</h2>
        <dl>
          <dt>
            <b>🔒 Client-Side Encryption</b>
          </dt>
          <dd>
            Your data&apos;s safety is our top priority. With &apos;I left
            it,&apos; your information is encrypted directly in your browser,
            ensuring that only you have access to your content.
          </dd>

          <dt>
            <b>⏳ Timed Access</b>
          </dt>
          <dd>
            Set a timer for your data to be accessible. Once the time limit is
            reached, even you won&apos;t be able to open it. Your secrets remain
            sealed until you decide otherwise.
          </dd>

          <dt>
            <b>🌐 Zero-Knowledge Architecture</b>
          </dt>
          <dd>
            Rest easy knowing that our servers have no knowledge of your
            encryption keys or data content. Your privacy is paramount, and we
            keep it that way.
          </dd>
        </dl>
      </section>
      <section>
        <p>
          Whether it&apos;s sensitive notes, confidential messages, or personal
          thoughts, &apos;I left it&apos; provides a secure and confidential way
          to retain your data. Sign up now and take control of your digital
          footprint with peace of mind.
        </p>
      </section>
    </main>
  );
}
