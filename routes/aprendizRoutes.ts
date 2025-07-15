import { Router } from "../dependencies/depnedencies.ts"
import {
  getAprendiz,
  getAprendizPorId,
  postAprendiz,
  putAprendiz,
  deleteAprendiz,
  postAprendicesMasivo,
} from "../controller/aprendizController.ts"

const aprendizRouter = new Router()

aprendizRouter.get("/aprendiz", getAprendiz)
aprendizRouter.get("/aprendiz/:id", getAprendizPorId)
aprendizRouter.post("/aprendiz", postAprendiz)
aprendizRouter.post("/aprendiz/masivo", postAprendicesMasivo)
aprendizRouter.put("/aprendiz", putAprendiz)
aprendizRouter.delete("/aprendiz/:id", deleteAprendiz)

export { aprendizRouter }
