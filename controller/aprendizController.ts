//deno-lint-ignore-file
import { Aprendiz } from "../model/aprendizModelo.ts"
import type { Context, RouterContext } from "../dependencies/depnedencies.ts"

export const getAprendiz = async (ctx: Context): Promise<void> => {
  const { response } = ctx
  try {
    const objAprendiz = new Aprendiz()
    const listaAprendices = await objAprendiz.SeleccionarAprendiz()
    response.status = 200
    response.body = {
      success: true,
      data: listaAprendices,
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

export const getAprendizPorId = async (ctx: RouterContext<"/aprendiz/:id">): Promise<void> => {
  const { response, params } = ctx
  try {
    const idAprendiz = Number.parseInt(params.id)
    const objAprendiz = new Aprendiz(null, idAprendiz)
    const aprendiz = await objAprendiz.SeleccionarAprendizPorId()

    if (aprendiz) {
      response.status = 200
      response.body = {
        success: true,
        data: aprendiz,
      }
    } else {
      response.status = 404
      response.body = {
        success: false,
        message: "Aprendiz no encontrado",
      }
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

export const postAprendiz = async (ctx: Context): Promise<void> => {
  const { response, request } = ctx
  try {
    const contentLength = request.headers.get("Content-Length")

    if (contentLength == "0") {
      response.status = 400
      response.body = { success: false, Error: "Cuerpo de la Solicitud Está Vacío!!!" }
      return
    }

    const body = await request.body.json()
    const AprendizData = {
      id_aprendiz: null,
      nombre: body.nombre,
      apellido: body.apellido,
      documento: body.documento,
      correo: body.correo,
      ciudad: body.ciudad,
    }

    const objAprendiz = new Aprendiz(AprendizData)
    const result = await objAprendiz.insertarAprendiz()

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

export const putAprendiz = async (ctx: Context): Promise<void> => {
  const { response, request } = ctx
  try {
    const contentLength = request.headers.get("Content-Length")

    if (contentLength == "0") {
      response.status = 400
      response.body = { success: false, Error: "Cuerpo de la Solicitud Está Vacío!!!" }
      return
    }

    const body = await request.body.json()
    const AprendizData = {
      id_aprendiz: body.id_aprendiz,
      nombre: body.nombre,
      apellido: body.apellido,
      documento: body.documento,
      correo: body.correo,
      ciudad: body.ciudad,
    }

    const objAprendiz = new Aprendiz(AprendizData)
    const result = await objAprendiz.EditarAprendiz()

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

export const deleteAprendiz = async (ctx: RouterContext<"/aprendiz/:id">): Promise<void> => {
  const { response, params } = ctx
  try {
    const idAprendiz = Number.parseInt(params.id)

    if (!idAprendiz || idAprendiz <= 0) {
      response.status = 400
      response.body = {
        success: false,
        Error: "ID del aprendiz es inválido",
      }
      return
    }

    const AprendizData = {
      id_aprendiz: idAprendiz,
      nombre: null,
      apellido: null,
      documento: null,
      correo: null,
      ciudad: null,
    }

    const objAprendiz = new Aprendiz(AprendizData)
    const result = await objAprendiz.EliminarAprendiz()

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

export const postAprendicesMasivo = async (ctx: Context): Promise<void> => {
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

    if (!Array.isArray(body.aprendices)) {
      response.status = 400
      response.body = {
        success: false,
        Error: "Se esperaba un array de aprendices en el campo 'aprendices'",
      }
      return
    }

    const objAprendiz = new Aprendiz()
    const result = await objAprendiz.insertarAprendicesMasivo(body.aprendices)

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
