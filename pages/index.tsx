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
      <section>
        <h2 id="core-design">Core Design</h2>
        <ul>
          <li>
            Client-Side Encryption
            <ul>
              <li>
                The app generates secret values: <i>key</i>, <i>iv</i>, and{' '}
                <i>salt</i> in the browser.
              </li>
              <li>
                The app creates a <i>crypto key</i> from <i>key</i> and{' '}
                <i>salt</i> with PBKDF2 using 100,000 iterations in the browser.
              </li>
              <li>
                The app encrypts plain text using <i>crypto key</i> and{' '}
                <i>iv</i> with AES256-GCM in the browser.
              </li>
              <li>
                The app creates an <i>auth key</i> from the <i>crypto key</i>{' '}
                using SHA-512.
              </li>
              <li>
                The app sends the <i>encrypted data</i> and the <i>auth key</i>{' '}
                to the server to persist and receives an ID for the item.
              </li>
              <li>
                The app shows the URL of the item and the secret for opening it.
              </li>
              <li>The user copies them and shares them with anyone.</li>
            </ul>
          </li>
          <li>
            Timed Access
            <ul>
              <li>
                Anyone cannot try decrypting the item before open time even if
                the user is owner.
              </li>
              <li>The owner user of the item can extends its open time.</li>
            </ul>
          </li>
          <li>
            Security risks
            <ul>
              <li>
                If a user account is compromised, there is a possibility of
                adding, deleting, replacing, or extending the publication date
                of data, but the contents of the data will not be viewed.
              </li>
              <li>
                Even if the secret for decryption is leaked, the contents of the
                data will not be exposed immediately as long as the publication
                date has not been reached.
              </li>
              <li>
                Even if the server is compromised, the data is encrypted, and
                the decryption key is not stored on the server, so the contents
                of the data will not be exposed immediately, but it may be
                susceptible to brute force attacks.
              </li>
            </ul>
          </li>
        </ul>
      </section>
    </main>
  );
}
