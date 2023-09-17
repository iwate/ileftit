import { NextApiRequest, NextApiResponse } from 'next';
import { deleteSubscription, listSubscriptions } from '../../../src/server/model';
import webpush from 'web-push';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return post(req, res);
    default:
      res.status(405).end();
  }
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-api-key'] !== process.env.ILEFTIT_API_KEY) {
    res.status(401).end();
    return;
  }
  webpush.setVapidDetails(
    'mailto:noreply@ileftit.com',
    process.env.WEBPUSH_PUBLIC_KEY,
    process.env.WEBPUSH_PRIVATE_KEY
  );
  const subs = listSubscriptions();
  for await (let [uid, json] of subs) {
    const info = JSON.parse(json);
    try {
      webpush.sendNotification(
        info,
        JSON.stringify({
          title: 'I left it',
          body: 'Do you extend open time for your data?',
        })
      );
    } catch (ex) {
      if (ex.statusCode === 410) {
        deleteSubscription(uid, info.endpoint);
      }
    }
  }
  res.status(204).end();
}
