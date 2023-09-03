import { useForm, SubmitHandler } from 'react-hook-form';
import { useLocale } from '../../../i18n/hooks';
import { themeFont } from '../../../utils/fonts';
import { useRouter } from 'next/router';
import { CryptoService } from '../../../src/client/crypto';
import { retrieve } from '../../../src/server/model';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import Head from 'next/head';

type WillState =
  | {
      status: 'close';
      verified: false;
    }
  | {
      status: 'close';
      verified: true;
      openAt: string;
    }
  | {
      status: 'open';
      verified: false;
    }
  | {
      status: 'open';
      verified: true;
      title: string;
      body: string;
    };

type Inputs = {
  secret: string;
};

const fetcher = (url) =>
  fetch(url).then((res) =>
    res.ok
      ? res.json().then((o) => ({ ...o, state: 'open' }))
      : { state: 'close' }
  );

export default function Page({ state }) {
  const { t, locale } = useLocale();
  const fmt = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const router = useRouter();
  const ep = `/api/wills/${router.query.bid}/?uid=${router.query.uid}`;
  const [data, mutate] = useState<WillState>(state);
  const [loading, setLoading] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (form) => {
    setLoading('show');
    try {
      const crypto = await CryptoService.create(form.secret);
      const password = crypto.getLoginPassword();
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.body) {
          data.body = await crypto.decrypt(data.body);
        }
        mutate(data);
      }
    } finally {
      setLoading(null);
    }
  };
  if (!data) return <div></div>;
  return (
    <>
      <Head>
        <title>I left it</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main>
        {data.status === 'open' && data.verified ? (
          <section className="form-vertical">
            <dl>
              <dt></dt>
              <dd>
                <label className={themeFont.className}>
                  for
                  <input readOnly defaultValue={data.title} />
                </label>
              </dd>
            </dl>
            <dl>
              <dt></dt>
              <dd>
                <textarea
                  rows={15}
                  readOnly
                  defaultValue={data.body}
                ></textarea>
              </dd>
            </dl>
          </section>
        ) : data.status === 'open' ? (
          <form className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
            <dl>
              <dt></dt>
              <dd>
                <p>{t.MessageUnverified}</p>
                <input
                  type="password"
                  placeholder={t.PlaceholderViewPassword}
                  {...register('secret', { required: true })}
                />
                {errors.secret?.type === 'required' && (
                  <p>{t.ValidationRequired}</p>
                )}
              </dd>
            </dl>
            <dl>
              <dt></dt>
              <dd>
                <Button
                  type="submit"
                  loading={loading === 'show'}
                  disabled={loading}
                >
                  {t.ActionShow}
                </Button>
              </dd>
            </dl>
          </form>
        ) : data.status === 'close' && data.verified ? (
          <section>
            <p className="text-center">
              {t.MessageCloseVerified.replaceAll(
                '{0}',
                fmt.format(new Date(data.openAt))
              )}
            </p>
          </section>
        ) : (
          <section>
            <p className="text-center">{t.MessageCloseUnverified}</p>
            <form className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
              <dl>
                <dt></dt>
                <dd>
                  <p>{t.MessageUnverified}</p>
                  <input
                    type="password"
                    placeholder={t.PlaceholderViewPassword}
                    {...register('secret', { required: true })}
                  />
                  {errors.secret?.type === 'required' && (
                    <p>{t.ValidationRequired}</p>
                  )}
                </dd>
              </dl>
              <dl>
                <dt></dt>
                <dd>
                  <Button
                    type="submit"
                    loading={loading === 'show'}
                    disabled={loading}
                  >
                    {t.ActionShow}
                  </Button>
                </dd>
              </dl>
            </form>
          </section>
        )}
      </main>
    </>
  );
}

export async function getServerSideProps(req, res) {
  const uid = req.query.uid as string;
  const bid = req.query.bid as string;
  const will = await retrieve(uid, bid);

  if (will === null) {
    return {
      props: {
        state: {
          status: 'close',
          verified: false,
        },
      },
    };
  }

  return {
    props: {
      state: {
        status: will.status,
        verified: false,
      },
    },
  };
}
