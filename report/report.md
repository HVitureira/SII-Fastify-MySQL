
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

fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
});

start();
```
<br>

Este código permite criarmos uma API em Fastify que houve a porta 3000 no localhost.
Como é possível ver no código, há um endpoint disponível, que é o GET '/'. Este devolve uma resposta no formato de um objeto com uma chave 'hello' e um valor 'world'. Se realizar-mos um pedido a este endpoint com, por exemplo, a ferramenta Postman, podemos ver isto a acontecer.

![Resposta da primeira rota, com um corpo JSON estático](assets/example-route.PNG)


# Adicionar um Middleware
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


# Servir Ficheiros Estáticos
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
fastify.get('/', async (request, reply) => {
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


# CRUD de uma Tabela

## Criar Tabela
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