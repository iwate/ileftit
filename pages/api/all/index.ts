import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { deleteAll, getSubscriptions, list } from '../../../src/server/model';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'DELETE':
      return del(req, res);
    default:
      res.status(405);
  }
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  if (!token?.uid) {
    res.status(401).json({
      err: 'Unauthorized',
    });
    return;
  }
  await deleteAll(String(token.uid));
  return res.status(204).end();
}
