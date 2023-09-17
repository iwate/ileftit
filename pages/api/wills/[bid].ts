import { NextApiRequest, NextApiResponse } from 'next';
import { deleteSubscription, getSubscriptions, log, retrieve } from '../../../src/server/model';
import { getToken } from 'next-auth/jwt';
import { getIp } from '../../../src/server/ip';
import webpush from 'web-push';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return post(req, res);
    case 'PUT':
      return put(req, res);
    case 'PATCH':
      return patch(req, res);
    case 'DELETE':
      return del(req, res);
    default:
      res.status(405);
  }
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const ip = getIp(req);
  const uid = req.query.uid as string;
  const bid = req.query.bid as string;
  const password = req.body.password as string;

  const will = await retrieve(uid, bid);

  if (will === null) {
    res.status(401).end();
    return;
  }

  webpush.setVapidDetails(
    'mailto:noreply@ileftit.com',
    process.env.WEBPUSH_PUBLIC_KEY,
    process.env.WEBPUSH_PRIVATE_KEY
  );
  const subs = await getSubscriptions(uid);
  for (let sub of subs) {
    const info = JSON.parse(sub.json);
    try {
      webpush.sendNotification(
        info,
        JSON.stringify({
          title: 'I left it',
          body: 'Someone try authorizing your data. Please check logs on the app.',
        })
      );
    } catch (ex) {
      if (ex.statusCode === 410) {
        deleteSubscription(uid, info.endpoint);
      }
    }
  }

  if (!will.authorize(password)) {
    await log(uid, bid, will.title, will.status, 'unauthorized', ip);
    res.status(401).end();
    return;
  }

  if (will.openAt > new Date()) {
    await log(uid, bid, will.title, 'close', 'authorized', ip);
    res.json({
      status: 'close',
      verified: true,
      openAt: will.openAt,
    });
  } else {
    const body = await will.body();
    if (body === null) {
      res.status(404).end();
      return;
    }

    await log(uid, bid, will.title, 'open', 'authorized', ip);
    res.json({
      status: 'open',
      verified: true,
      title: will.title,
      openAt: will.openAt,
      body: body.toString(),
    });
  }
}

async function put(req: NextApiRequest, res: NextApiResponse) {
  const ip = getIp(req);
  const bid: string = req.query.bid as string;
  const title: string = req.body.title;
  const body: string = req.body.body;
  const token = await getToken({ req });
  if (!token.uid) {
    res.json({
      err: 'Unauthorized',
    });
    return;
  }
  const will = await retrieve(String(token.uid), bid);
  if (will === null) {
    res.status(404).end();
    return;
  }
  await will.replace(title, Buffer.from(body));
  await log(String(token.uid), bid, will.title, will.status, 'replace', ip);
  res.status(204).end();
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const ip = getIp(req);
  const bid: string = req.query.bid as string;
  const hours: number = req.body.extend;
  const token = await getToken({ req });
  if (!token.uid) {
    res.json({
      err: 'Unauthorized',
    });
    return;
  }
  const will = await retrieve(String(token.uid), bid);
  if (will === null) {
    res.status(404).end();
    return;
  }
  await will.extend(hours);
  await log(String(token.uid), bid, will.title, will.status, 'extend', ip);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const ip = getIp(req);
  const bid: string = req.query.bid as string;
  const token = await getToken({ req });
  if (!token.uid) {
    res.json({
      err: 'Unauthorized',
    });
    return;
  }
  const will = await retrieve(String(token.uid), bid);
  if (will === null) {
    res.status(404).end();
    return;
  }
  await will.remove();
  await log(String(token.uid), bid, will.title, will.status, 'remove', ip);
  res.status(204).end();
}
