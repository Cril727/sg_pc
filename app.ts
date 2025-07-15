import { Application, oakCors, send } from "./dependencies/depnedencies.ts"
import { aprendizRouter } from "./routes/aprendizRoutes.ts"
import { dispositivoRouter } from "./routes/dispositivoRoutes.ts"
import { aprendizDispositivoRouter } from "./routes/aprendizDispositivoRouter.ts"


const app = new Application()

app.use(
  oakCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Middleware para servir archivos estáticos
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname
  if (path.startsWith("/uploads/")) {
    await send(ctx, path, {
      root: Deno.cwd(),
    })
  } else {
    await next()
  }
})

// Middleware de logging
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`)
  await next()
})

const routes = [aprendizRouter, dispositivoRouter, aprendizDispositivoRouter]

routes.forEach((route) => {
  app.use(route.routes())
  app.use(route.allowedMethods())
})

// Middleware de manejo de errores
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    console.error("Error:", error)
    ctx.response.status = 500
    ctx.response.body = {
      success: false,
      message: "Error interno del servidor",
    }
  }
})

const PORT = 8000
console.log(`Servidor corriendo en http://localhost:${PORT}`)
await app.listen({ port: PORT })
