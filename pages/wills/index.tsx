import Link from 'next/link';
import useSWRInfinite from 'swr/infinite';
import { useLocale } from '../../i18n/hooks';
import { themeFont } from '../../utils/fonts';
import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useState,
} from 'react';
import { Button } from '../../components/Button';
import { getToken } from 'next-auth/jwt';
import { list } from '../../src/server/model';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { subscribe, updateSubscriptionIfExist } from '../../src/client/push';

const fetcher = (path) => fetch(path).then((res) => res.json());
const extend = (bids: string[], hours: number) => {
  return Promise.all(
    bids.map((bid) => {
      return fetch(`/api/wills/${bid}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extend: hours,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error(res.statusText);
      });
    })
  );
};

const PAGE_SIZE = 3;
const getKey = (pageIndex, prev) => {
  if (prev && !prev.items && prev.items.length === 0) return null;
  if (pageIndex === 0) return `/api/logs/?size=${PAGE_SIZE}`;
  return `/api/logs?size=${PAGE_SIZE}&skiptoken=${
    prev.items[prev.items.length - 1].rowKey
  }`;
};
function History() {
  const { t, locale } = useLocale();
  const fmth = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const fmtl = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const { data, error, size, setSize, isLoading } = useSWRInfinite(
    getKey,
    fetcher
  );
  const more = () => setSize(size + 1);
  if (error) return <div className="text-center">Failed to load</div>;
  if (!data) return <div></div>;
  return (
    <table className="history">
      <caption>Operation Logs</caption>
      <thead>
        <tr>
          <th>timestamp</th>
          <th>item(ID)</th>
          <th>status</th>
          <th>op</th>
          <th>ip</th>
        </tr>
      </thead>
      <tbody>
        {data
          .flatMap((o) => o.items)
          .map((o) => (
            <tr key={o.rowKey}>
              <td>
                {fmth.format(new Date(o.timestamp))}
                <br />
                {fmtl.format(new Date(o.timestamp))}
              </td>
              <td>
                {o.title}
                <br />(
                {o.bid.substring(0, 3) +
                  '...' +
                  o.bid.substring(o.bid.length - 3)}
                )
              </td>
              <td>{o.status}</td>
              <td>{o.reason}</td>
              <td>{o.ip}</td>
            </tr>
          ))}
      </tbody>
      {data.length > 0 && data[data.length - 1].items.length === PAGE_SIZE && (
        <tfoot>
          <tr>
            <td colSpan={5}>
              <Button
                type="button"
                looks="text"
                onClick={more}
                loading={isLoading}
              >
                {t.ActionMore}
              </Button>
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

const $1day = 24 * 60 * 60 * 1000;
const saveExtendHours = (value: number) =>
  localStorage.setItem('extend_hours', String(value));
const loadExtendHours = (defaultValue: number) => {
  const str = localStorage.getItem('extend_hours');
  if (str === undefined || str === null) return defaultValue;

  const value = parseInt(str);
  if (Number.isNaN(value)) return defaultValue;

  return value;
};

function OpenAt({ date }: { date: Date }) {
  const { t, locale } = useLocale();
  const fmt1 = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const fmt2 = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const normalize = (str: string) => str.replace(/\s/g, ' ');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dt = date.getTime() - today.getTime();
  const label = `${t.LabelOpenAt} ${normalize(
    dt > 0 && dt < $1day ? fmt2.format(date) : fmt1.format(date)
  )}`;
  return <small>{label}</small>;
}

function NotificationForm({ publicKey }) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(null);
  const [[reg, sub], setState] = useState<
    [reg: ServiceWorkerRegistration | null, sub: PushSubscription | null]
  >([null, null]);
  useEffect(() => {
    if (publicKey) {
      updateSubscriptionIfExist(publicKey).then(setState);
    }
  }, [publicKey]);
  const getNotification = async () => {
    setLoading('subscribe');
    try {
      const result = await subscribe(reg, publicKey);
      setState([reg, result]);
    } finally {
      setLoading(null);
    }
  };
  return (
    <>
      {reg && !sub && (
        <>
          <hr />
          <dl>
            <dt></dt>
            <dd>
              <Button
                loading={loading === 'subscribe'}
                disabled={loading}
                onClick={getNotification}
              >
                {t.ActionGetNotification}
              </Button>
            </dd>
          </dl>
        </>
      )}
    </>
  );
}

export default function Home({ items, publicKey }) {
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [extendHours, setExtendHours] = useState(12);
  useEffect(() => {
    setExtendHours(loadExtendHours(12));
  }, [setExtendHours]);
  const updateExtendHours: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const value = Number(e.target.value);
    saveExtendHours(value);
    setExtendHours(value);
  };
  const onSubmit = (bids: string[]): FormEventHandler<HTMLFormElement> => {
    return (e) => {
      e.preventDefault();
      setLoading(`extend-${bids.length > 1 ? 'all' : bids[0]}`);
      extend(bids, extendHours)
        .then((data) => {
          router.push('/wills/');
        })
        .catch(() => {
          alert('An error occured.');
        })
        .finally(() => {
          setLoading(null);
        });
    };
  };
  return (
    <main className="home">
      <section className="will-list">
        {items.map((will) => (
          <details key={will.bid} className="will-list-item">
            <summary>
              <span className={themeFont.className}>for</span>
              {will.title}
              <OpenAt date={new Date(will.openAt)} />
            </summary>

            <form className="form-horizontal" onSubmit={onSubmit([will.bid])}>
              <dl>
                <dt></dt>
                <dd>
                  <select
                    name="extend"
                    value={extendHours}
                    onChange={updateExtendHours}
                  >
                    <option value={12}>12 {t.LabelHours}</option>
                    <option value={24}>24 {t.LabelHours}</option>
                    <option value={3 * 24}>3 {t.LabelDays}</option>
                    <option value={7 * 24}>7 {t.LabelDays}</option>
                    <option value={14 * 24}>14 {t.LabelDays}</option>
                    <option value={30 * 24}>31 {t.LabelDays}</option>
                  </select>
                </dd>
              </dl>
              <dl>
                <dt></dt>
                <dd>
                  <Button
                    type="submit"
                    looks="text"
                    loading={loading === 'extend-' + will.bid}
                    disabled={loading}
                  >
                    {t.ActionExtend}
                  </Button>
                  <Link
                    href={`/wills/${will.bid}/@replace`}
                    className="btn-text"
                  >
                    {t.ActionReplace}
                  </Link>
                  <Link
                    href={`/wills/${will.bid}/@delete`}
                    className="btn-text"
                  >
                    {t.ActionDelete}
                  </Link>
                </dd>
              </dl>
            </form>
          </details>
        ))}
        {items.length < 10 && (
          <div className="will-list-footer">
            <Link href={`/wills/@create`} className="btn-text">
              + {t.ActionAdd}
            </Link>
          </div>
        )}
      </section>
      <section className="pr">
        <ul>
          <li>
            <Image src="/img/pr.png" width={64} height={64} alt="PR" />
            <p>Monthly sponsors can PR at here.</p>
            <Link href="https://github.com/sponsors/iwate">
              https://github.com/sponsors/iwate
            </Link>
          </li>
        </ul>
      </section>
      {items.length > 0 && (
        <form
          className="form-horizontal right"
          onSubmit={onSubmit(items.map((will) => will.bid))}
        >
          <dl className="w100">
            <dt></dt>
            <dd>
              <div className="btn-group w100">
                <select
                  name="extend"
                  value={extendHours}
                  onChange={updateExtendHours}
                >
                  <option value={12}>12 {t.LabelHours}</option>
                  <option value={24}>24 {t.LabelHours}</option>
                  <option value={3 * 24}>3 {t.LabelDays}</option>
                  <option value={7 * 24}>7 {t.LabelDays}</option>
                  <option value={14 * 24}>14 {t.LabelDays}</option>
                  <option value={30 * 24}>31 {t.LabelDays}</option>
                </select>
                <Button
                  type="submit"
                  className="flex"
                  loading={loading === 'extend-all'}
                  disabled={loading}
                >
                  {t.ActionExtendAll}
                </Button>
              </div>
            </dd>
          </dl>
        </form>
      )}
      <hr />
      <History />
      <NotificationForm publicKey={publicKey} />
      <hr />
      <section className="sponsors">
        <h2>Sponsored by</h2>
        <ul>
          <li>@username</li>
          <li>@username</li>
          <li>@username</li>
          <li>...</li>
          <li>
            All sponsors can be listed here.
            <Link href="https://github.com/sponsors/iwate">
              https://github.com/sponsors/iwate
            </Link>
          </li>
        </ul>
      </section>
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
  return {
    props: {
      items: items.map((o) => ({
        bid: o.bid,
        title: o.title,
        openAt: o.openAt.toISOString(),
      })),
      publicKey: process.env.WEBPUSH_PUBLIC_KEY,
    },
  };
}
