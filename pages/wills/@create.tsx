import { useForm, SubmitHandler } from 'react-hook-form';
import { useLocale } from '../../i18n/hooks';
import { themeFont } from '../../utils/fonts';
import { useRouter } from 'next/router';
import { CryptoService } from '../../src/client/crypto';
import React, {
  ButtonHTMLAttributes,
  MouseEventHandler,
  useState,
} from 'react';
import { Button } from '../../components/Button';
import { getToken } from 'next-auth/jwt';
import Link from 'next/link';

type CreatedState = {
  uid: string;
  bid: string;
  secret: string;
};

type Inputs = {
  title: string;
  body: string;
};

export default function Page() {
  const { t } = useLocale();
  const router = useRouter();
  const [created, setCreated] = useState<CreatedState>();
  const [copyText, setCopyText] = useState(t.ActionCopy);
  const [loading, setLoading] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading('create');
    try {
      const crypto = await CryptoService.create();
      const secret = crypto.getSecret();
      const password = crypto.getLoginPassword();
      const body = await crypto.encrypt(data.body);
      const res = await fetch('/api/wills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          body,
          password,
        }),
      });
      if (res.ok) {
        setCreated({
          ...(await res.json()),
          secret,
        });
      }
    } finally {
      setLoading(null);
    }
  };
  const gotoTop = () => router.push('/');
  const result = `## URL 
https://${location.host}/view/${created?.uid}/${created?.bid}

## Password
${created?.secret}`;
  const copy: MouseEventHandler<HTMLButtonElement> = (e) => {
    window.navigator.clipboard.writeText(result).then(() => {
      setCopyText(t.ActionCopied);
      setTimeout(() => setCopyText(t.ActionCopy), 2000);
    });
  };
  return (
    <main>
      {created ? (
        <section className="form-vertical">
          <dl>
            <dt></dt>
            <dd>
              {t.MessageCreated.split('\n').map((line) => (
                <p key={line}>{line}</p>
              ))}
              <textarea rows={20} readOnly defaultValue={result}></textarea>
            </dd>
          </dl>
          {window.navigator.clipboard && (
            <dl>
              <dt></dt>
              <dd>
                <button type="button" className="btn" onClick={copy}>
                  {copyText}
                </button>
              </dd>
            </dl>
          )}
          <dl>
            <dt></dt>
            <dd>
              <Link href="/wills" className="btn-text text-center">
                {t.ActionBack}
              </Link>
            </dd>
          </dl>
        </section>
      ) : (
        <form className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
          <dl>
            <dt></dt>
            <dd>
              <label className={themeFont.className}>
                for
                <input
                  placeholder={t.PlaceholderFor}
                  {...register('title', { required: true, maxLength: 20 })}
                />
              </label>
              {errors.title?.type === 'required' && (
                <p>{t.ValidationRequired}</p>
              )}
              {errors.title?.type === 'maxLength' && (
                <p>{t.ValidationMaxLength.replaceAll('{0}', '20')}</p>
              )}
            </dd>
          </dl>
          <dl>
            <dt></dt>
            <dd>
              <textarea
                rows={15}
                {...register('body', { required: true, maxLength: 10000 })}
              ></textarea>
              {errors.body?.type === 'required' && (
                <p>{t.ValidationRequired}</p>
              )}
              {errors.body?.type === 'maxLength' && (
                <p>{t.ValidationMaxLength.replaceAll('{0}', '10000')}</p>
              )}
            </dd>
          </dl>
          <dl>
            <dt></dt>
            <dd>
              <Button
                type="submit"
                loading={loading === 'create'}
                disabled={loading}
              >
                {t.ActionCreate}
              </Button>
            </dd>
          </dl>
          <dl>
            <dt></dt>
            <dd>
              <Link href="/wills" className="btn-text text-center">
                {t.ActionBack}
              </Link>
            </dd>
          </dl>
        </form>
      )}
    </main>
  );
}

export async function getServerSideProps(req, res) {
  const token = await getToken(req);
  if (!token?.uid) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
}
