# Tutorial: Fastify & MySQL

## Unidade curricular: Sistemas de Informação para a Internet

### Autor: Henoch Vitureira, nº 201601081

<hr>

<!-- vscode-markdown-toc -->
* 1. [Introdução](#Introduo)
* 2. [Instalação](#Instalao)
* 3. [Criação do Servidor](#CriaodoServidor)
* 4. [Adicionar um Middleware](#AdicionarumMiddleware)
* 5. [Servir Ficheiros Estáticos](#ServirFicheirosEstticos)
* 6. [CRUD de uma Tabela](#CRUDdeumaTabela)
	* 6.1. [Criar Tabela](#CriarTabela)
	* 6.2. [Instalar Plugin MySQL](#InstalarPluginMySQL)
	* 6.3. [Endpoints](#Endpoints)
		* 6.3.1. [Create Produto](#CreateProduto)
		* 6.3.2. [Read Produto](#ReadProduto)
		* 6.3.3. [Update Produto](#UpdateProduto)
		* 6.3.4. [Delete Produto](#DeleteProduto)
	* 6.4. [Validar Pedidos](#ValidarPedidos)
* 7. [Ficheiro app.js](#Ficheiroapp.js)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->
##  1. <a name='Introduo'></a>Introdução
Este documento tem como objetivo documentar uma séries de instruções de forma passo-a-passo para instruir os leitores na criação de uma API REST com a framework Node.js, Fastify, assim como utilizar a mesma API para realizar conexões à base de dados, de forma a realizarem-se as operações CRUD sobre uma dada tabela.

Ao longo do documento irá constar descrições do processo e imagens elucidativas do mesmo.

##  2. <a name='Instalao'></a>Instalação
Para começar, precisamos de ter o Node.js instalado, assim como o seu gestor de pacotes, o NPM. Posteriormente precisamos de navegar à diretoria em que queremos criar o nosso servidor e correr o comando `npm init`, de forma a criarmos o ficheiro 'package.json', que contem a referência das nossas dependências e scripts que acharmos úteis.

Para instalarmos o Fastify, corremos o comando `npm install fastify --save`.

Temos de garantir que o nosso entrypoint é o ficheiro app.js da raiz da diretoria em questão.

##  3. <a name='CriaodoServidor'></a>Criação do Servidor
No ficheiro app.js podemos adicionar o código abaixo.

<br>

```javascript
const fastify = require('fastify')({
    logger: true
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

start();
```
<br>

Este código permite criarmos uma API em Fastify que houve a porta 3000 no localhost.
Como é possível ver no código, há um endpoint disponível, que é o GET '/'. Este devolve uma resposta no formato de um objeto com uma chave 'hello' e um valor 'world'. Se realizar-mos um pedido a este endpoint com, por exemplo, a ferramenta Postman, podemos ver isto a acontecer.

![Resposta da primeira rota, com um corpo JSON estático](assets/example-route.PNG)


##  4. <a name='AdicionarumMiddleware'></a>Adicionar um Middleware
Em Fastify também podemos adicionar middleware, como na framework mais conhecida, express.js. Como exemplo vamos adicionar o middleware conhecido, **Helmet**. Começamos por instalar o plugin com o commando `npm install @fastify/helmet`. Depois podemos importar o plugin para uma variável, o que nos permite usar o método 'register' do Fastify para o passarmos a utilizar em nos pedidos realizados à nossa API. Abaixo encontra-se o código que se pretende adicionar, com a primeira instrução de importação do Fastify como referência do código anterior.

<br>

```javascript
const fastify = require('fastify')({
    logger: true
});
const helmet = require('@fastify/helmet');

fastify.register(helmet);
```
<br>

Estas instrução ativam o helmet de forma global em todos os endpoints, no entanto é possível alterar estas opções, possíveis de serem consultadas em: [https://github.com/fastify/fastify-helmet](https://github.com/fastify/fastify-helmet).


##  5. <a name='ServirFicheirosEstticos'></a>Servir Ficheiros Estáticos
Para servirmos ficheiros estáticos, por exemplo, dentro da uma pasta 'public' na raiz da nossa diretoria, podemos usar o plugin '@fastify/static'. Começamos por instalar o plugin com o comando `npm install --save @fastify/static`. À semelhança do Helmet, importamos o plugin para uma variável e utilizamos o método 'register' do Fastify. Pegando no exemplo de código do Helmet, podemos dar continuidade aqui.

<br>

```javascript
const fastify = require('fastify')({
    logger: true
});
const path = require('path');
const helmet = require('@fastify/helmet');
const static = require('@fastify/static');

fastify.register(helmet);

fastify.register(static, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
});
```
<br>

Como é possível visualizar, também utilizamos o pacote 'path' para ajudar com a escrita do caminho para a nossa pasta 'public'. Para testarmos isto, criamos um ficheiro 'htmlExample.html' dentro da pasta 'public' com o seguinte conteúdo.

<br>

```html
<h1>This is an example File</h1>
```

<br>

Agora podemos criar um endpoint com, por exemplo, o verbo GET, para a nossa API nos servir este ficheiro. Podemos colocá-lo em baixo ao endpoint que adicionamos anteriormente.

<br>

```javascript
fastify.get('/', async (req, reply) => {
    return { hello: 'world' };
})

fastify.get('/static/example', function (req, reply) {
    return reply.sendFile('htmlExample.html');
    // serving path.join(__dirname, 'public', 'htmlExample.html') directly
})
```
<br>

Após colocarmos o endpoint num browser, podemos ver que a API devolve o ficheiro.

![Resposta da rota que nos serve um ficheiro HTML estático](assets/static-html-serve.png)


##  6. <a name='CRUDdeumaTabela'></a>CRUD de uma Tabela

###  6.1. <a name='CriarTabela'></a>Criar Tabela
Para praticarmos operações CRUD em Fastify numa tabela de base de dados MySQL, devemos primeiro criar uma base de dados e tabela no nosso sistema. Vamos então criar uma tabela 'produto' simples, dentro de uma base de dados 'mes_sii_ii'.

<br>

```sql
  create database mes_sii_ii;
     use mes_sii_ii;
    CREATE TABLE produto (
        id int(11) NOT NULL auto_increment,
        nome varchar(100) NOT NULL,	
        preco double NOT NULL,
        quantidade int(11) NOT NULL,
        PRIMARY KEY (id)
     );
```

###  6.2. <a name='InstalarPluginMySQL'></a>Instalar Plugin MySQL
Para utilizarmos MySQL em Fastify instalamos o plugin da framework '@fastify/mysql'. Para isto corremos o comando `npm install @fastify/mysql --save`. Com isto podemos registar o plugin à semelhança do que foi feito anteriormente neste documento. Uma coisa importante a ter em conta é que este plugin, para efetuar a conexão à base de dados, utiliza uma connection string, em vez de um JSON de opções, que se costuma ver noutras ocasiões. Uma connection string de MySQL aqui é constituída da seguinte forma: `mysql://nome-de-utilizador:password@localhost:port/nome-da-base-de-dados`, pelo que devemos substituir os valores apropriados para podermos realizar conexões à base de dados.

<br>

```javascript
const fastify = require('fastify')({
    logger: true
});
const path = require('path');
const helmet = require('@fastify/helmet');
const fastifyStatic = require('@fastify/static');
const mySql = require('@fastify/mysql');

fastify.register(helmet)

fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
});

fastify.register(mySql, {
    promise: true,
    connectionString: 'mysql://root:12345@localhost/mes_sii_ii'
});
```
Podemos colocar o registo do plugin MySQL abaixo do registo dos ficheiros estáticos. Neste caso temos a opção `promise: true` pois isto permite-nos usar promessas no acesso à base de dados, o que nos permite usar **async** e **await**.

###  6.3. <a name='Endpoints'></a>Endpoints
####  6.3.1. <a name='CreateProduto'></a>Create Produto
Para criarmos um produto na base de dados precisamos de criar o endpoint para tal acontecer. O esqueleto é semelhante ao dos dois endpoints de exemplo criados, mas neste caso, utilizamos o verbo POST com o método **post()** do Fastify.

<br>

```javascript
fastify.get('/static/example', function (req, reply) {
    return reply.sendFile('htmlExample.html');
    // serving path.join(__dirname, 'public', 'htmlExample.html') directly
})

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
})
```

Temos acesso ao MySQL do Fastify chamarmos a propriedade **mysql** da variável **fastify**. A propriedade **mysql** tem um método **getConnection()**, que de forma assíncrona nos devolve uma conexão à nossa base de dados. Com a conexão, podemos chamar o método **query()** para realizar queries à base de dados, em que os parâmetros variáveis podem ser inseridos nas queries como pontos de interrogação, que são preenchidos pela mesma ordem que os elementos do array parâmetro a seguir. Depois da nossa query correr, não nos podemos esquecer de fechar a conexão com a base de dados, devido a questões de segurança e evitar memory leak.

Ao realizar-mos um pedido, podemos ver a resposta com o resultado na query, nomeadamente o último id inserido e o número de registos afetados. De notar que estamos a ler os parâmetros para a criação do produto a partir do corpo JSON do pedido, que neste caso tem o nome 'cereja', preço igual a 4, e quantidade 35.

![Resposta do endpoint para criar um produto](assets/post-request.PNG)

####  6.3.2. <a name='ReadProduto'></a>Read Produto
Sabendo a forma como os verbos e queries funcionam fazer um endpoint para se realizar o retrieve de um produto. Podemos colocar este endpoint logo abaixo do anterior. Como se trata de um retrieve, utilizamos o verbo GET.

<br>

```javascript
fastify.get('/produto/:id', async (req, reply) => {
    const connection = await fastify.mysql.getConnection();
    const [rows, fields] = await connection.query(
        'SELECT * FROM produto WHERE id = ?',
        [req.params.id],
    );
    connection.release();
    return rows[0];
});
```
Como queremos que o id do produto a consultar venha a partir de um parâmetro, temos '/:id' na rota do endpoint. Como queremos separar o resultado da query, guardamos o mesmo num array, donde devolvemos o primeiro registo. Abaixo podemos ve ro resultado. 

![Resposta do endpoint para ler um produto](assets/get-request.PNG)


####  6.3.3. <a name='UpdateProduto'></a>Update Produto
Para atualizarmos um produto, além de precisarmos de pedir o id por parâmetro, também precisamos dos dados vindos do corpo do pedido, no formato JSON. Como se trata de um update, utilizamos o verbo PUT, ou seja, o método **put()** do Fastify.

<br>

```javascript
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
```

Podemos testar o endpoint no Postman ou outra ferramenta parecida. Abaixo encontra.se o resultado. Neste caso estamos a alterar o preco e a quantidade.

![Resposta do endpoint para atualizar um produto](assets/update-request.PNG)


####  6.3.4. <a name='DeleteProduto'></a>Delete Produto
Para apagarmos um produto, é algo muito semelhante ao retrieve, só que com o verbo DELETE e a query MySQL apropriada.

<br>

```javascript
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
```

Após testarmos o pedido, podemos ver o corpo devolvido com o resultado da query, com o número de registos afetado sendo 1, o que é o esperado.

![Resposta do endpoint para atualizar um produto](assets/delete-request.PNG)


###  6.4. <a name='ValidarPedidos'></a>Validar Pedidos
Um dos pontos fulcrais do Fastify é a validação dos requests, que é realizada com JSON Schema. Podemos fazer um schema para validar uma dada rota, validando o seu corpo, headers, etc. Podemos então usar um dado schema como o segundo parâmetro de uma rota, fazendo com que esse schema valide os pedidos que acionem esta rota. Nesta caso podemos utilizar um schema para validar as rotas de criar produto e atualizar produto.

```javascript
const productValidator = {
    schema: {
      body: {
        type: 'object',
        required: ['nome', 'preco', 'quantidade'],
        properties: {
          nome: { type: 'string' },
          preco: { type: 'number' },
          quantidade: { type: 'number' },
        }
      }
    }
  }

fastify.post('/produto', productValidator, async (req, reply) => {

fastify.put('/produto/:id', productValidator, async (req, reply) => {
```

Este esqueça valida que que todas as propriedades 'nome', 'preco', 'quantidade' estão presentes (required). Também valida o tipo de dados de cada propriedade, string para o nome do produto, número para o preço e quantidade.

Ao fazer-se um pedido com dados inválidos, a nossa API responde de forma adequada.

![Resposta do endpoint para atualizar um produto validado](assets/post-request-validate.PNG)

O mesmo acontece quando dados obrigatórios não estão presentes.

![Resposta do endpoint para atualizar um produto validado](assets/post-request-validate2.PNG)


##  7. <a name='Ficheiroapp.js'></a>Ficheiro app.js
No final devemos ter um ficheiro app.js com o seguinte código:

```javascript
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

const productValidator = {
    schema: {
      body: {
        type: 'object',
        required: ['nome', 'preco', 'quantidade'],
        properties: {
          nome: { type: 'string' },
          preco: { type: 'number' },
          quantidade: { type: 'number' },
        }
      }
    }
  }

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

fastify.post('/produto', productValidator, async (req, reply) => {
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

fastify.put('/produto/:id', productValidator, async (req, reply) => {
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
```