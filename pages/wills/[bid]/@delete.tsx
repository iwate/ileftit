import Link from 'next/link';
import { useLocale } from '../../../i18n/hooks';
import { themeFont } from '../../../utils/fonts';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getToken } from 'next-auth/jwt';
import { retrieve } from '../../../src/server/model';
import { useState } from 'react';
import { Button } from '../../../components/Button';

type Inputs = {
  confirm: string;
};

export default function Page({ bid, title }) {
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (data.confirm === 'yes') {
      setLoading('delete');
      try {
        const res = await fetch(`/api/wills/${bid}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/wills');
        }
      } finally {
        setLoading(null);
      }
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
              <input defaultValue={title} readOnly />
            </label>
          </dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>
            <p>{t.MessageDelete}</p>
            <input
              {...register('confirm', { required: true, pattern: /^yes$/ })}
            />
            {errors.confirm?.type === 'required' && <p>required</p>}
            {errors.confirm?.type === 'pattern' && <p>{t.ValidationYes}</p>}
          </dd>
        </dl>
        <dl>
          <dt></dt>
          <dd>
            <Button
              type="submit"
              loading={loading === 'delete'}
              disabled={loading}
            >
              {t.ActionDelete}
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
