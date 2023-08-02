import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { socketConnection } from './socket';
import { createServer } from './server';

const PORT = process.env.PORT || 3001;

const app: Express = express();

const { server, type, host } = createServer(app);

socketConnection(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'host') {
  const publicPath = path.join(__dirname, '../..', '/client/dist');

  app.use(express.static(publicPath));

  app.get('*', (_: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

server.listen(PORT, async () => {
  console.log(`Server is running at ${type}://${host}:${PORT}`);
});
