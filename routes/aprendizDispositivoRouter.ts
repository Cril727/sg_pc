import { Router } from "../dependencies/depnedencies.ts"
import {
  getAsignaciones,
  getAsignacionesPorAprendiz,
  postAsignacion,
  deleteAsignacion,
  postAsignacionesMasivas,
} from "../controller/aprendizDispositivoController.ts"

const aprendizDispositivoRouter = new Router()

aprendizDispositivoRouter.get("/asignacion", getAsignaciones)
aprendizDispositivoRouter.get("/asignacion/aprendiz/:id", getAsignacionesPorAprendiz)
aprendizDispositivoRouter.post("/asignacion", postAsignacion)
aprendizDispositivoRouter.post("/asignacion/masivo", postAsignacionesMasivas)
aprendizDispositivoRouter.delete("/asignacion", deleteAsignacion)

export { aprendizDispositivoRouter }
