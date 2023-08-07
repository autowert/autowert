import http from 'http';

if (process.env.SERVER_PORT) {
  const port: number = Number(process.env.SERVER_PORT) || 8080;

  const server = http.createServer((req, res) => {
    res.end('ok');
  });

  server.listen(port);
}
