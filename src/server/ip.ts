import { NextApiRequest } from 'next';

export function getIp(req: NextApiRequest) {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(/, /)[0] : req.socket.remoteAddress;
  return ip;
}
