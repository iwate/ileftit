import { useLocale } from '../../../i18n/hooks';
import { themeFont } from '../../../utils/fonts';
import { getToken } from 'next-auth/jwt';
import { retrieve } from '../../../src/server/model';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { CryptoService } from '../../../src/client/crypto';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import Link from 'next/link';

type Inputs = {
  title: string;
  body: string;
  secret: string;
};

export default function Page({ bid, title }) {
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      title,
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const crypto = await CryptoService.create(data.secret);
    const password = crypto.getLoginPassword();
    const body = await crypto.encrypt(data.body);
    setLoading('replace');
    try {
      const res = await fetch(`/api/wills/${bid}`, {
        method: 'PUT',
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
        router.push('/wills');
      }
    } finally {
      setLoading(null);
    }
  };
  return (
    <main>
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
            {errors.title?.type === 'required' && <p>{t.ValidationRequired}</p>}
            {errors.title?.type === 'maxLength' && (
              <p>{t.ValidationMaxLength.replaceAll('{0}', '20')}</p>
            )}
          </dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>
            <textarea
              placeholder={t.PlaceholderReplaceText}
              rows={15}
              {...register('body', { required: true, maxLength: 10000 })}
            ></textarea>
            {errors.body?.type === 'required' && <p>{t.ValidationRequired}</p>}
            {errors.body?.type === 'maxLength' && (
              <p>{t.ValidationMaxLength.replaceAll('{0}', '10000')}</p>
            )}
          </dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>
            <input
              type="password"
              placeholder={t.PlaceholderReplacePassword}
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
              loading={loading === 'replace'}
              disabled={loading}
            >
              {t.ActionReplace}
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
  const item = await retrieve(String(token.uid), req.query.bid);
  if (!item) {
    return {
      notFound: true,
    };
  }
  return {
    props: { bid: req.query.bid, title: item.title },
  };
}
