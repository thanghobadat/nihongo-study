import type { NextApiRequest, NextApiResponse } from 'next';

// Prevent Express from opening a standalone TCP port when loaded inside Next.js / Vercel Serverless
process.env.DISABLE_EXPRESS_LISTEN = '1';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const expressApp = require('../../../../backend/src/index');

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return expressApp(req, res);
}
