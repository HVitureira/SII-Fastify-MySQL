const fastify = require('fastify')({
    logger: true
});
const path = require('path');
const helmet = require('@fastify/helmet');
const fastifyStatic = require('@fastify/static');
const mySql = require('@fastify/mysql');

fastify.register(helmet);

fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
});

fastify.register(mySql, {
    promise: true,
    connectionString: 'mysql://root:12345@localhost/mes_sii_ii'
});

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

fastify.get('/', async (req, reply) => {
    return { hello: 'world' };
});

fastify.get('/static/example', function (req, reply) {
    return reply.sendFile('htmlExample.html');
    // serving path.join(__dirname, 'public', 'htmlExample.html') directly
});

fastify.post('/produto', async (req, reply) => {
    const connection = await fastify.mysql.getConnection();
    const result = await connection.query(
        'INSERT INTO produto (nome, preco, quantidade) VALUES (?,?,?)',
        [req.body.nome, req.body.preco, req.body.quantidade,],
    );
    connection.release();
    reply.code(201);
    return { 
        result: result
    };
});

fastify.get('/produto/:id', async (req, reply) => {
    const connection = await fastify.mysql.getConnection();
    const [rows, fields] = await connection.query(
        'SELECT * FROM produto WHERE id = ?',
        [req.params.id],
    );
    connection.release();
    return rows[0];
});

fastify.put('/produto/:id', async (req, reply) => {
    const connection = await fastify.mysql.getConnection();
    const result = await connection.query(
        'UPDATE produto SET nome = ?, preco = ?, quantidade = ? WHERE id = ?',
        [req.body.nome, req.body.preco, req.body.quantidade, req.params.id],
    );
    connection.release();
    return { 
        result: result
    };
});

fastify.delete('/produto/:id', async (req, reply) => {
    const connection = await fastify.mysql.getConnection();
    const result = await connection.query(
        'DELETE FROM produto WHERE id = ?',
        [req.params.id],
    );
    connection.release();
    return { 
        result: result
    };
});

start();