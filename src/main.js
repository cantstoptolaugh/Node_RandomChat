// @ts-check

//Template engine: Pug
// CSS framework : TailWind
const Koa = require('koa')
const Pug = require('koa-pug')
const path = require('path')
const route = require('koa-route')
const websokify = require('koa-websocket')
const serve = require('koa-static')
const app = websokify(new Koa())
const mount = require('koa-mount')
const mongoClient = require('./mongo')

// @ts-ignore
// eslint-disable-next-line no-new
new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app, // Binding `ctx.render()`, equals to pug.use(app)
})

app.use(mount('/public', serve('src/public')))

app.use(async (ctx) => {
  await ctx.render('main')
})

const _client = mongoClient.connect()

async function getChatsCollection() {
  const client = await _client
  return client.db('chat').collection('chats')
}

app.ws.use(
  route.all('/ws', async (ctx) => {
    const chatsCollection = await getChatsCollection()
    const chatsCursor = chatsCollection.find(
      {},
      {
        sort: {
          createdAt: 1,
        },
      }
    )

    const chats = await chatsCursor.toArray()
    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        payload: {
          chats,
        },
      })
    )

    ctx.websocket.on('message', async (data) => {
      /** @type {chat}*/
      // @ts-ignore
      const chat = JSON.parse(data)

      await chatsCollection.insertOne({
        ...chat,
        createAt: new Date(),
      })

      const { message, nickname } = chat

      const { server } = app.ws

      // @ts-ignore
      server.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            payload: {
              message,
              nickname,
            },
          })
        )
      })
    })
  })
)

app.listen(4500)
