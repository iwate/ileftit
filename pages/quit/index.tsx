import Link from 'next/link';
import { useLocale } from '../../i18n/hooks';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getToken } from 'next-auth/jwt';
import { getSubscriptions, list, retrieve } from '../../src/server/model';
import { MouseEventHandler, useState } from 'react';
import { Button } from '../../components/Button';
import { signOut } from 'next-auth/react';

type Inputs = {
  confirm: string;
};

export default function Page({ itemsCount, subsCount }) {
  const { t } = useLocale();
  const [hasData, setHasData] = useState(itemsCount > 0 || subsCount > 0);
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
        const res = await fetch(`/api/all`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setHasData(false);
        }
      } finally {
        setLoading(null);
      }
    }
  };
  const moveToQuit: MouseEventHandler<HTMLButtonElement> = (e) => {
    setLoading('quit');
    signOut({ callbackUrl: '/api/auth/quit/' });
  };
  return (
    <main>
      <form className="form-vertical" onSubmit={handleSubmit(onSubmit)}>
        {hasData && (
          <>
            <dl>
              <dt></dt>
              <dd>
                <p>{t.MessageHasData.replaceAll('{0}', itemsCount).replaceAll('{1}', subsCount)}</p>
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
          </>
        )}
        {!hasData && (
          <>
            <h2 className="text-center">{t.MessageCanQuit}</h2>
            <dl>
              <dt></dt>
              <dd>
                <p>{t.DescQuit}</p>
                <Button
                  type="button"
                  loading={loading === 'quit'}
                  disabled={loading}
                  onClick={moveToQuit}
                >
                  Proceed quitting account
                </Button>
              </dd>
            </dl>
          </>
        )}
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
  const items = await list(String(token.uid));
  const subs = await getSubscriptions(String(token.uid));
  return {
    props: {
      itemsCount: items.length,
      subsCount: subs.length,
    },
  };
}
