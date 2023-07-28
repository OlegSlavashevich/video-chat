import { Express } from 'express';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';
import ip from 'ip';

export const createServer = (app: Express) => {
  if (process.env.NODE_ENV === 'prod') {
    const keyPath = path.join(__dirname, '../', '/cert/server.key');
    const certPath = path.join(__dirname, '../', '/cert/server.cert');

    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    return {
      server: https.createServer(
        {
          key,
          cert
        },
        app
      ),
      type: 'https',
      host: ip.address()
    };
  }

  return {
    server: http.createServer(app),
    type: 'http',
    host: 'localhost'
  };
};
