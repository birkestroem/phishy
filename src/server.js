const Koa = require('koa');
const Router = require('koa-router');
const KoaJSON = require('koa-json');
const middlewareP0f = require('./middleware/p0f');
const crypto = require('crypto');
const p0f = require('p0fclient-wrapper');
const redis = require('redis');
const client = redis.createClient({ host: 'redis' });

const router = new Router();
const app = new Koa();

app.proxy = true;
app
    .use(middlewareP0f())
    .use(KoaJSON({
        pretty: false, 
        param: 'pretty'
    }))
    .use(router.routes())
    .use(router.allowedMethods());

router.get('/store', async (ctx) => {
    const ip = ipaddr.parse(ctx.ip).toNormalizedString();
    
    try {
        const data = await p0f(ip);
        redis.hset(ip, (data || {}).stringify(), 'EX', 10);
    } catch (e) {}

    
    const bogusToken = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    ctx.body = { 
        'access': 'granted',
        'token': bogusToken
    };
});



app.listen(3000);
