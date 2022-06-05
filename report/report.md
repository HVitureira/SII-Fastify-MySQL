
# Tutorial: Fastify & MySQL

## Unidade curricular: Sistemas de Informação para a Internet

### Autor: Henoch Vitureira, nº 201601081

<hr>

# Introdução
Este documento tem como objetivo documentar uma séries de instruções de forma passo-a-passo para instruir os leitores na criação de uma API REST com a framework Node.js, Fastify, assim como utilizar a mesma API para realizar conexões à base de dados, de forma a realizarem-se as operações CRUD sobre uma dada tabela.

Ao longo do documento irá constar descrições do processo e imagens elucidativas do mesmo.

# Instalação
Para começar, precisamos de ter o Node.js instalado, assim como o seu gestor de pacotes, o NPM. Posteriormente precisamos de navegar à diretoria em que queremos criar o nosso servidor e correr o comando `npm init`, de forma a criarmos o ficheiro 'package.json', que contem a referência das nossas dependências e scripts que acharmos úteis.

Para instalarmos o Fastify, corremos o comando `npm install fastify --save`.

Temos de garantir que o nosso entrypoint é o ficheiro app.js da raiz da diretoria em questão.

# Criação do Servidor
No ficheiro app.js podemos adicionar o código abaixo.

```javascript
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
```
Este código permite criarmos uma API em Fastify que houve a porta 3000 no localhost.
Como é possível ver no código, há um endpoint disponível, que é o GET '/'. Este devolve uma resposta no formato de um objeto com uma chave 'hello' e um valor 'world'. Se realizar-mos um pedido a este endpoint com, por exemplo, a ferramenta Postman, podemos ver isto a acontecer.

![Resposta da primeira rota, com um corpo JSON estático](assets/example-route.PNG)