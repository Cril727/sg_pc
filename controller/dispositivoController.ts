//deno-lint-ignore-file
import { Dispositivo } from "../model/dispotitivoModelo.ts"
import type { Context, RouterContext } from "../dependencies/depnedencies.ts"

export const getDispositivo = async (ctx: Context): Promise<void> => {
  const { response } = ctx
  try {
    const objDispositivo = new Dispositivo()
    const listaDispositivos = await objDispositivo.SeleccionarDispositivo()
    response.status = 200
    response.body = {
      success: true,
      data: listaDispositivos,
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

export const getDispositivoPorId = async (ctx: RouterContext<"/dispositivo/:id">): Promise<void> => {
  const { response, params } = ctx
  try {
    const idDispositivo = Number.parseInt(params.id)
    const objDispositivo = new Dispositivo(null, idDispositivo)
    const dispositivo = await objDispositivo.SeleccionarDispositivoPorId()

    if (dispositivo) {
      response.status = 200
      response.body = {
        success: true,
        data: dispositivo,
      }
    } else {
      response.status = 404
      response.body = {
        success: false,
        message: "Dispositivo no encontrado",
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

export const postDispositivo = async (ctx: Context): Promise<void> => {
  const { response, request } = ctx
  try {
    const contentType = request.headers.get("Content-Type")

    if (contentType && contentType.includes("multipart/form-data")) {
      const body = request.body.formData()
      const formData = await body
      let marca = ""
      let modelo = ""
      let serial = ""
      let fecha_adquisicion = ""
      let estado = ""
      let foto = ""

      try {
        await Deno.stat("uploads")
      } catch {
        await Deno.mkdir("uploads", { recursive: true })
      }

      for (const [key, value] of formData.entries()) {
        if (key === "marca") {
          marca = value as string
        } else if (key === "modelo") {
          modelo = value as string
        } else if (key === "serial") {
          serial = value as string
        } else if (key === "fecha_adquisicion") {
          fecha_adquisicion = value as string
        } else if (key === "estado") {
          estado = value as string
        } else if (key === "foto" && value instanceof File) {
          const file = value as File
          if (file.size > 0) {
            const extension = file.name.split(".").pop()
            const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`
            const filePath = `uploads/${uniqueName}`

            const arrayBuffer = await file.arrayBuffer()
            await Deno.writeFile(filePath, new Uint8Array(arrayBuffer))
            foto = filePath
          }
        }
      }

      const DispositivoData = {
        id_computador: null,
        marca: marca,
        modelo: modelo,
        serial: serial,
        fecha_adquisicion: fecha_adquisicion,
        estado: estado,
        foto: foto,
      }

      const objDispositivo = new Dispositivo(DispositivoData)
      const result = await objDispositivo.insertarDispositivo()
      response.status = 200
      response.body = {
        success: true,
        body: result,
      }
    } else {
      const contentLength = request.headers.get("Content-Length")
      if (contentLength == "0") {
        response.status = 400
        response.body = { success: false, Error: "Cuerpo de la Solicitud Está Vacío!!!" }
        return
      }

      const body = await request.body.json()
      const DispositivoData = {
        id_computador: null,
        marca: body.marca,
        modelo: body.modelo,
        serial: body.serial,
        fecha_adquisicion: body.fecha_adquisicion,
        estado: body.estado,
        foto: body.foto || null,
      }

      const objDispositivo = new Dispositivo(DispositivoData)
      const result = await objDispositivo.insertarDispositivo()
      response.status = 200
      response.body = {
        success: true,
        body: result,
      }
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

export const putDispositivo = async (ctx: Context): Promise<void> => {
  const { response, request } = ctx
  try {
    const contentType = request.headers.get("Content-Type")

    if (contentType && contentType.includes("multipart/form-data")) {
      const body = request.body.formData()
      const formData = await body
      let id_computador: number | null = null
      let marca = ""
      let modelo = ""
      let serial = ""
      let fecha_adquisicion = ""
      let estado = ""
      let foto = ""

      try {
        await Deno.stat("uploads")
      } catch {
        await Deno.mkdir("uploads", { recursive: true })
      }

      for (const [key, value] of formData.entries()) {
        if (key === "id_computador") {
          id_computador = Number.parseInt(value as string)
        } else if (key === "marca") {
          marca = value as string
        } else if (key === "modelo") {
          modelo = value as string
        } else if (key === "serial") {
          serial = value as string
        } else if (key === "fecha_adquisicion") {
          fecha_adquisicion = value as string
        } else if (key === "estado") {
          estado = value as string
        } else if (key === "foto" && value instanceof File) {
          const file = value as File
          if (file.size > 0) {
            const extension = file.name.split(".").pop()
            const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`
            const filePath = `uploads/${uniqueName}`

            const arrayBuffer = await file.arrayBuffer()
            await Deno.writeFile(filePath, new Uint8Array(arrayBuffer))
            foto = filePath
          }
        } else if (key === "fotoActual") {
          if (!foto) foto = value as string
        }
      }

      const DispositivoData = {
        id_computador: id_computador,
        marca: marca,
        modelo: modelo,
        serial: serial,
        fecha_adquisicion: fecha_adquisicion,
        estado: estado,
        foto: foto,
      }

      const objDispositivo = new Dispositivo(DispositivoData)
      const result = await objDispositivo.EditarDispositivo()
      response.status = 200
      response.body = {
        success: true,
        body: result,
      }
    } else {
      const contentLength = request.headers.get("Content-Length")
      if (contentLength == "0") {
        response.status = 400
        response.body = { success: false, Error: "Cuerpo de la Solicitud Está Vacío!!!" }
        return
      }

      const body = await request.body.json()
      const DispositivoData = {
        id_computador: body.id_computador,
        marca: body.marca,
        modelo: body.modelo,
        serial: body.serial,
        fecha_adquisicion: body.fecha_adquisicion,
        estado: body.estado,
        foto: body.foto,
      }

      const objDispositivo = new Dispositivo(DispositivoData)
      const result = await objDispositivo.EditarDispositivo()
      response.status = 200
      response.body = {
        success: true,
        body: result,
      }
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

export const deleteDispositivo = async (ctx: RouterContext<"/dispositivo/:id">): Promise<void> => {
  const { response, params } = ctx
  try {
    const idDispositivo = Number.parseInt(params.id)

    if (!idDispositivo || idDispositivo <= 0) {
      response.status = 400
      response.body = {
        success: false,
        Error: "ID del dispositivo es inválido",
      }
      return
    }

    const objDispositivoConsulta = new Dispositivo(null, idDispositivo)
    const dispositivoExistente = await objDispositivoConsulta.SeleccionarDispositivoPorId()

    const DispositivoData = {
      id_computador: idDispositivo,
      marca: null,
      modelo: null,
      serial: null,
      fecha_adquisicion: null,
      estado: null,
      foto: null,
    }

    const objDispositivo = new Dispositivo(DispositivoData)
    const result = await objDispositivo.EliminarDispositivo()

    if (result.success && dispositivoExistente && dispositivoExistente.foto) {
      try {
        await Deno.remove(dispositivoExistente.foto)
      } catch (deleteError: unknown) {
        console.warn("Error al eliminar archivo de foto:", deleteError)
      }
    }

    response.status = 200
    response.body = {
      success: true,
      body: result,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    response.status = 500
    response.body = {
      success: false,
      message: "Error interno del servidor",
      error: errorMessage,
    }
  }
}

export const servirArchivo = async (ctx: RouterContext<"/uploads/:filename">): Promise<void> => {
  const { response, params } = ctx

  try {
    const filename = params.filename
    const filePath = `uploads/${filename}`

    try {
      const fileInfo = await Deno.stat(filePath)
      if (fileInfo.isFile) {
        const file = await Deno.readFile(filePath)

        const extension = filename.split(".").pop()?.toLowerCase()
        let contentType = "application/octet-stream"

        switch (extension) {
          case "jpg":
          case "jpeg":
            contentType = "image/jpeg"
            break
          case "png":
            contentType = "image/png"
            break
          case "gif":
            contentType = "image/gif"
            break
          case "webp":
            contentType = "image/webp"
            break
        }

        response.headers.set("Content-Type", contentType)
        response.body = file
      } else {
        response.status = 404
        response.body = { success: false, message: "Archivo no encontrado" }
      }
    } catch {
      response.status = 404
      response.body = { success: false, message: "Archivo no encontrado" }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    response.status = 500
    response.body = {
      success: false,
      message: "Error interno del servidor",
      error: errorMessage,
    }
  }
}

export const postDispositivosMasivo = async (ctx: Context): Promise<void> => {
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

    if (!Array.isArray(body.dispositivos)) {
      response.status = 400
      response.body = {
        success: false,
        Error: "Se esperaba un array de dispositivos en el campo 'dispositivos'",
      }
      return
    }

    const objDispositivo = new Dispositivo()
    const result = await objDispositivo.insertarDispositivosMasivo(body.dispositivos)

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
