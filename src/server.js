const Koa = require('koa');
const Router = require('koa-router');
const KoaJSON = require('koa-json');
const crypto = require('crypto');
const p0f = require('p0fclient-wrapper');
const ipaddr = require('ipaddr.js');
const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient({ host: 'redis' });

const router = new Router();
const app = new Koa();

client.on('error', function (err) {
    console.error('Redis error: ' + err);
});

app.proxy = true;
app
    .use(KoaJSON({
        pretty: false, 
        param: 'pretty'
    }))
    .use(router.routes())
    .use(router.allowedMethods());

router.get('/set', async (ctx) => {
    const ip = ipaddr.parse(ctx.request.ip).toNormalizedString();
    
    try {
        const data = await p0f(ip);
        client.set(ip, JSON.stringify(data || {}), 'EX', 6000);
    } catch (e) {
        console.error(e);
    }

    const bogusToken = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    ctx.body = { 
        'access': 'granted',
        'token': bogusToken,
        'ip': ip
    };
});

router.get('/get/:ip', async (ctx) => {
    const reply = await client.getAsync(ctx.params.ip);
    ctx.body = JSON.parse(reply);
});


app.listen(3000);
