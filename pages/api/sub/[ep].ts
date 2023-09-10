import { NextApiRequest, NextApiResponse } from 'next';
import { getSubscription, setSubscription } from '../../../src/server/model';
import { getToken } from 'next-auth/jwt';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return get(req, res);
    default:
      res.status(405).end();
  }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const endpoint = req.query.ep as string;
  const token = await getToken({ req });
  if (!token?.uid) {
    res.status(401).json({
      err: 'Unauthorized',
    });
    return;
  }
  const sub = await getSubscription(String(token.uid), endpoint);

  if (sub) {
    res.status(204).end();
  } else {
    res.status(404).end();
  }
}
