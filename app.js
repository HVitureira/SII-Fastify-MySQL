
const fastify = require('fastify')({
    logger: true
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

start()