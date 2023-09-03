import { NextApiRequest, NextApiResponse } from 'next';
import { add, list, log } from '../../../src/server/model';
import { getToken } from 'next-auth/jwt';
import { getIp } from '../../../src/server/ip';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return post(req, res);
    default:
      res.status(405).end();
  }
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const ip = getIp(req);
  const title: string = req.body.title;
  const body: string = req.body.body;
  const password: string = req.body.password;
  const token = await getToken({ req });
  if (!token?.uid) {
    res.status(401).json({
      err: 'Unauthorized',
    });
    return;
  }

  const items = await list(String(token.uid));
  if (items.length >= 10) {
    res.status(400).json({
      err: 'MaxItems',
    });
  }

  let openAt: Date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
  if (items.length > 0) {
    openAt = new Date(Math.max(...items.map((item) => item.openAt.getTime())));
  }

  const created = await add(
    String(token.uid),
    title,
    Buffer.from(body),
    openAt,
    password
  );
  const state = openAt > new Date() ? 'close' : 'open';
  await log(String(token.uid), created.bid, title, state, 'add', ip);
  res.json(created);
}
