
const fastify = require('fastify')({
    logger: true
});
const path = require('path');
const helmet = require('@fastify/helmet');
const fastifyStatic = require('@fastify/static');

fastify.register(helmet)

fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
})

const port = 3000;

const start = async () => {
    try {
        await fastify.listen(port);
        console.log(`listening on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
})

fastify.get('/static/example', function (req, reply) {
    return reply.sendFile('htmlExample.html');
    // serving path.join(__dirname, 'public', 'htmlExample.html') directly
})


start();