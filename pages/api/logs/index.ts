import { NextApiRequest, NextApiResponse} from 'next'
import { history } from '../../../src/server/model';
import { getToken } from 'next-auth/jwt';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET': return get(req, res);
        default: 
            res.status(405).end();
    }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req });
    if (!token?.uid) {
        res.status(401).json({
            err: 'Unauthorized'
        });
        return;
    }
    const skiptoken = req.query.skiptoken as string || '';
    const pageSize = parseInt(req.query.size as string || '10');
    const items = await history(String(token.uid), skiptoken, pageSize);
    res.json({items});
}
