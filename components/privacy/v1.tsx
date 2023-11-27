export function PrivacyV1() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <h2 id="definitions">Definitions</h2>
      <p>
        &apos;I left it&apos; is owned by{' '}
        <a target="_blank" rel="noopener" href="https://github.com/iwate">
          @iwate
        </a>
        , based in Tokyo - Japan. It referred to as &quot;I&quot;,
        &quot;Me&quot;, &quot;Our&quot; or &quot;We&quot;. As a customer of this
        service you&#39;re a &quot;User&quot; or &quot;You&quot; according to
        this policy. The applications or any services offered by us will be
        referred to as &quot;I left it&quot;, &quot;App&quot; or
        &quot;Website&quot;.
      </p>
      <h2 id="how-does-app-collect-data-about-me">
        How does &apos;I left it&apos; collect data about me?
      </h2>
      <p>&apos;I left it&apos; collects data about you:</p>
      <ul>
        <li>
          when you browse the websites, ileftit.com or ileftit.b2clogin.com
        </li>
        <li>
          when you create an account for &apos;I left it&apos; or update your
          account
        </li>
        <li>when you send support, privacy, legal, and other requests to us</li>
        <li>when you create, replace, delete and try authorizing data</li>
      </ul>
      <h2 id="what-data-does-app-collect-about-me-and-why">
        What data does &apos;I left it&apos; collect about me, and why?
      </h2>
      <p>
        <b>&apos;I left it&apos; collects email address.</b>
      </p>
      <p>
        When you sign up &apos;I left it&apos;, your email address is stored to
        <a
          target="_blank"
          rel="noopener"
          href="https://azure.microsoft.com/services/active-directory-b2c/"
        >
          Azure Active Directory B2C
        </a>
      </p>
      <p>We use your email to:</p>
      <ul>
        <li>confirm if your email address is correct to sign you up</li>
        <li>contact you in special circumstances related to your account</li>
        <li>contact you about support requests</li>
        <li>
          contact you about legal requests, like DMCA takedown requests and
          privacy complaints
        </li>
        <li>announce service changes, and features</li>
      </ul>
      <p>
        <b>&apos;I left it&apos; collects IP address.</b>
      </p>
      <p>
        When you create, replace, delete and try authorizing, your IP address is
        stored to our log storage.
      </p>
      <p>We use your IP address to:</p>
      <ul>
        <li>show you operation logs</li>
        <li>investigate if a incident is occurred</li>
      </ul>
      <h2 id="where-does-app-keep-data-about-me">
        Where does &apos;I left it&apos; keep data about me?
      </h2>
      <p>
        All ata about website use on servers in the United States of America. I
        sometimes retrieve those data to my personal computers in Japan. I use
        the data to develop, debug and maintain the service. The data is erased
        from my computers when no longer needed.
      </p>
      <h2 id="how-can-i-erase-data-about-me">How can I erase data about me?</h2>
      <p>
        If you wish to delete your data, email ileftit@iwate.me and let us know
        which user needs to be erased.
      </p>
      <p>We complete the deletion of the data within 30 days.</p>
      <h2 id="what-cookies-does-app-use">
        What Cookies does &apos;I left it&apos; use?
      </h2>
      <table>
        <caption>ileftit.com</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Expiration</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>next-auth.session-token</td>
            <td>30 days</td>
            <td>Used for keeping user&apos;s login state.</td>
          </tr>
          <tr>
            <td>next-auth.callback-url</td>
            <td>End of browser session</td>
            <td>URL used for returning after signin.</td>
          </tr>
          <tr>
            <td>next-auth.csrf-token</td>
            <td>End of browser session</td>
            <td>Cross-Site Request Forgery token used for CRSF protection.</td>
          </tr>
        </tbody>
      </table>
      <table>
        <caption>ileftit.b2clogin.com</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Expiration</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>x-ms-cpim-slice</td>
            <td>End of browser session</td>
            <td>
              Used to route requests to the appropriate production instance.
            </td>
          </tr>
          <tr>
            <td>x-ms-cpim-trans</td>
            <td>End of browser session</td>
            <td>
              Used for tracking the transactions (number of authentication
              requests to Azure AD B2C) and the current transaction.
            </td>
          </tr>
          <tr>
            <td>x-ms-cpim-sso:{'{id}'}</td>
            <td>End of browser session</td>
            <td>
              Used for maintaining the SSO session. This cookie is set as
              persistent, when Keep Me Signed In is enabled.
            </td>
          </tr>
          <tr>
            <td>x-ms-cpim-cache:{'{id}'}_n</td>
            <td>End of browser session, successful authentication</td>
            <td>Used for maintaining the request state.</td>
          </tr>
          <tr>
            <td>x-ms-cpim-csrf</td>
            <td>End of browser session</td>
            <td>Cross-Site Request Forgery token used for CRSF protection.</td>
          </tr>
          <tr>
            <td>x-ms-cpim-dc</td>
            <td>End of browser session</td>
            <td>Used for Azure AD B2C network routing.</td>
          </tr>
          <tr>
            <td>x-ms-cpim-ctx</td>
            <td>End of browser session</td>
            <td>Context</td>
          </tr>
          <tr>
            <td>x-ms-cpim-rp</td>
            <td>End of browser session</td>
            <td>
              Used for storing membership data for the resource provider tenant.
            </td>
          </tr>
          <tr>
            <td>x-ms-cpim-rc</td>
            <td>End of browser session</td>
            <td>Used for storing the relay cookie.</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
