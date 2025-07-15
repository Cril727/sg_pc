import { Router } from "../dependencies/depnedencies.ts"
import {
  getDispositivo,
  getDispositivoPorId,
  postDispositivo,
  putDispositivo,
  deleteDispositivo,
  servirArchivo,
  postDispositivosMasivo,
} from "../controller/dispositivoController.ts"

const dispositivoRouter = new Router()

dispositivoRouter.get("/uploads/:filename", servirArchivo)
dispositivoRouter.get("/dispositivo", getDispositivo)
dispositivoRouter.get("/dispositivo/:id", getDispositivoPorId)
dispositivoRouter.post("/dispositivo", postDispositivo)
dispositivoRouter.post("/dispositivo/masivo", postDispositivosMasivo)
dispositivoRouter.put("/dispositivo", putDispositivo)
dispositivoRouter.delete("/dispositivo/:id", deleteDispositivo)

export { dispositivoRouter }
