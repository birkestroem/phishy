const p0f = require('p0fclient-wrapper');
const debug = require('debug')('middleware:p0f')
const ipaddr = require('ipaddr.js');
const defaultOptions = {
    'headerPrefix': 'x-p0f-' 
};

module.exports = function(options) {
    const opts = Object.assign(options || {}, defaultOptions);
    debug('Options: ' + require('util').inspect(opts, { depth: null }));

    return async function middlewareP0f(ctx, next) {
        const ip = ipaddr.parse(ctx.ip).toNormalizedString();
        
        try {
            const data = await p0f(ip);
            Object.keys(data || {}).forEach((key) => {
                ctx.set(opts.headerPrefix + key, data[key]);
            });
        } catch (e) {
            ctx.set(opts.headerPrefix + 'status', 'error');
            ctx.set(opts.headerPrefix + 'error', e.toString());
        }
        next();
    }
}
