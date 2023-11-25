import { getRandomValues } from 'crypto';
import { inspect } from 'util';

import http from 'http';
import Koa from 'koa';
import { koaBody } from 'koa-body';

import { dashCredentials } from '../../config';

const app = new Koa();

const getRandomString = (length: number) => Array.from(getRandomValues(new Uint8Array(length)), (v) => String.fromCharCode((v % 75) + 48)).join('');
app.keys = [getRandomString(128)];

app.use(async (ctx, next) => {
  if (['/authme', '/.dash'].includes(ctx.path)) return next();

  ctx.body = 'ok';
});

app.use(async (ctx, next) => {
  if (ctx.path !== '/authme') return next();

  const authorization = ctx.get('Authorization');

  if (!authorization) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Basic realm="dev site"');
  } else {
    ctx.redirect('/');
  }
});

app.use(async (ctx, next) => {
  const authorization = ctx.get('Authorization');

  if (!authorization)
    return ctx.redirect('/');

  if (authorization.slice(0, 6) !== 'Basic ') return ctx.status = 400;
  const encoded = authorization.slice(6);
  const decoded = atob(encoded);
  const parts = decoded.split(':');
  const username = parts[0] || '';
  const password = parts[1] || '';

  if (
    username !== dashCredentials.username ||
    password !== dashCredentials.password
  ) {
    ctx.status = 401;
    return ctx.redirect('/')
  }

  return next();
});

app.use(koaBody({ text: true }));
app.use(async (ctx, next) => {
  if (ctx.path !== '/.dash') return ctx.status = 500;

  if (ctx.method === 'GET') {
    ctx.set('Content-Type', 'text/html');
    ctx.body = `
<h1>secret website</h1>
<textarea id="execute"></textarea>
<button onclick="btn = this; btn.disabled = true; fetch('.dash', { method: 'POST', body: document.querySelector('#execute').value }).then(res => res.text(), res => res.text()).then(text => { alert(text); btn.disabled = false; })">execute</button>
`.slice(1, -1);
  } else if (ctx.method === 'POST') {
    const code = ctx.request.body as any;
    if (typeof code !== 'string' || !code) return ctx.status = 400;

    console.log('executing code\n%s', JSON.stringify(code));

    try {
      const res = await eval(code);

      ctx.status = 200;
      ctx.body = inspect(res, false, 2, false);
    } catch (err) {
      ctx.status = 500;
      ctx.body = inspect(err, false, 2, false);
    }
  } else {
    ctx.status = 400;
  }
});

const port: number = Number(process.env.SERVER_PORT) || 47394;

const server = http.createServer(app.callback());
server.listen(port, () => {
  if (process.env.SERVER_PORT) return;
  console.log('http server listening on http://localhost:' + port + '/');
});
