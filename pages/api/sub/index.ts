import { NextApiRequest, NextApiResponse } from 'next';
import { setSubscription } from '../../../src/server/model';
import { getToken } from 'next-auth/jwt';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return post(req, res);
    default:
      res.status(405).end();
  }
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const json = JSON.stringify(req.body.subscription);
  const endpoint = req.body.subscription.endpoint as string;
  const expirationTime = req.body.subscription.expirationTime as number;
  const token = await getToken({ req });
  if (!token?.uid) {
    res.status(401).json({
      err: 'Unauthorized',
    });
    return;
  }
  await setSubscription(String(token.uid), json, endpoint, expirationTime);
  res.status(204).end();
}
