//deno-lint-ignore-file
import { AprendizDispositivo } from "../model/aprendizDispositivoModelo.ts"
import type { Context, RouterContext } from "../dependencies/depnedencies.ts"

export const getAsignaciones = async (ctx: Context): Promise<void> => {
  const { response } = ctx
  try {
    const objAsignacion = new AprendizDispositivo()
    const listaAsignaciones = await objAsignacion.SeleccionarAsignaciones()
    response.status = 200
    response.body = {
      success: true,
      data: listaAsignaciones,
    }
  } catch (error: unknown) {
    response.status = 400
    response.body = {
      success: false,
      msg: "Error al procesar la solicitud",
      errors: error,
    }
  }
}

export const getAsignacionesPorAprendiz = async (ctx: RouterContext<"/asignacion/aprendiz/:id">): Promise<void> => {
  const { response, params } = ctx
  try {
    const idAprendiz = Number.parseInt(params.id)
    const objAsignacion = new AprendizDispositivo()
    const asignaciones = await objAsignacion.SeleccionarAsignacionPorAprendiz(idAprendiz)

    response.status = 200
    response.body = {
      success: true,
      data: asignaciones,
    }
  } catch (error: unknown) {
    response.status = 400
    response.body = {
      success: false,
      msg: "Error al procesar la solicitud",
      errors: error,
    }
  }
}

export const postAsignacion = async (ctx: Context): Promise<void> => {
  const { response, request } = ctx
  try {
    const contentLength = request.headers.get("Content-Length")

    if (contentLength == "0") {
      response.status = 400
      response.body = { success: false, Error: "Cuerpo de la Solicitud Está Vacío!!!" }
      return
    }

    const body = await request.body.json()
    const AsignacionData = {
      id_aprendiz: body.id_aprendiz,
      id_computador: body.id_computador,
    }

    const objAsignacion = new AprendizDispositivo(AsignacionData)
    const result = await objAsignacion.insertarAsignacion()

    response.status = 200
    response.body = {
      success: true,
      body: result,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    response.status = 400
    response.body = {
      success: false,
      Error: "Algo ha Salido Mal!!!",
      details: errorMessage,
    }
  }
}

export const deleteAsignacion = async (ctx: Context): Promise<void> => {
  const { response, request } = ctx
  try {
    const contentLength = request.headers.get("Content-Length")
    if (contentLength == "0") {
      response.status = 400
      response.body = { success: false, Error: "Cuerpo de la Solicitud Está Vacío!!!" }
      return
    }

    const body = await request.body.json()

    const AsignacionData = {
      id_aprendiz: body.id_aprendiz,
      id_computador: body.id_computador,
    }

    const objAsignacion = new AprendizDispositivo(AsignacionData)
    const result = await objAsignacion.EliminarAsignacion()

    response.status = 200
    response.body = {
      success: true,
      body: result,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    response.status = 400
    response.body = {
      success: false,
      Error: "Algo ha Salido Mal!!!",
      details: errorMessage,
    }
  }
}

export const postAsignacionesMasivas = async (ctx: Context): Promise<void> => {
  const { response, request } = ctx
  try {
    const contentType = request.headers.get("Content-Type")

    if (!contentType || !contentType.includes("application/json")) {
      response.status = 400
      response.body = {
        success: false,
        Error: "Content-Type debe ser application/json para carga masiva",
      }
      return
    }

    const body = await request.body.json()

    if (!Array.isArray(body.asignaciones)) {
      response.status = 400
      response.body = {
        success: false,
        Error: "Se esperaba un array de asignaciones en el campo 'asignaciones'",
      }
      return
    }

    const objAsignacion = new AprendizDispositivo()
    const result = await objAsignacion.insertarAsignacionesMasivas(body.asignaciones)

    response.status = 200
    response.body = {
      success: true,
      body: result,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    response.status = 400
    response.body = {
      success: false,
      Error: "Error en carga masiva",
      details: errorMessage,
    }
  }
}
