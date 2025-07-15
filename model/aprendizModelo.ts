//deno-lint-ignore-file
import { con } from "./Conexion.ts"
import { z } from "../dependencies/depnedencies.ts"

interface AprendizData {
  id_aprendiz: number | null
  nombre: string | null
  apellido: string | null
  documento: string | null
  correo: string | null
  ciudad: string | null
}

export class Aprendiz {
  public _objAprendiz: AprendizData | null
  public _idAprendiz: number | null

  constructor(objAprendiz: AprendizData | null = null, idAprendiz: number | null = null) {
    this._objAprendiz = objAprendiz
    this._idAprendiz = idAprendiz
  }

  public async SeleccionarAprendiz(): Promise<AprendizData[]> {
    const { rows: aprendices } = await con.execute(`SELECT * FROM aprendiz`)
    return aprendices as AprendizData[]
  }

  public async SeleccionarAprendizPorId(): Promise<AprendizData | null> {
    if (!this._idAprendiz) {
      throw new Error("ID de Aprendiz requerido")
    }
    const { rows: aprendices } = await con.execute(`SELECT * FROM aprendiz WHERE id_aprendiz = ?`, [this._idAprendiz])
    return aprendices.length > 0 ? (aprendices[0] as AprendizData) : null
  }

  public async insertarAprendiz(): Promise<{ success: boolean; message: string; Aprendiz?: Record<string, unknown> }> {
    try {
      if (!this._objAprendiz) {
        throw new Error("No se ha Proporcionado un Objeto de Aprendiz Válido!!!")
      }

      const { nombre, apellido, documento, correo, ciudad } = this._objAprendiz

      if (!nombre || !apellido || !documento || !correo || !ciudad) {
        throw new Error("Faltan Campos Requeridos para Insertar el Aprendiz.")
      }

      await con.execute("START TRANSACTION")

      const result = await con.execute(
        `INSERT INTO aprendiz (nombre, apellido, documento, correo, ciudad) VALUES (?,?,?,?,?)`,
        [nombre, apellido, documento, correo, ciudad],
      )

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        const [Aprendiz] = await con.query(`SELECT * FROM aprendiz WHERE id_aprendiz = LAST_INSERT_ID()`)

        await con.execute("COMMIT")
        return { success: true, message: "Aprendiz Registrado con Éxito!!!", Aprendiz: Aprendiz }
      } else {
        throw new Error("No es Posible Registrar el Aprendiz!!!")
      }
    } catch (error: unknown) {
      await con.execute("ROLLBACK")
      if (error instanceof z.ZodError) {
        return { success: false, message: error.message }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Error Interno del Servidor!!!"
        return { success: false, message: errorMessage }
      }
    }
  }

  public async EditarAprendiz(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this._objAprendiz) {
        throw new Error("No se ha Proporcionado un Objeto de Aprendiz Válido!!!")
      }

      const { nombre, apellido, documento, correo, ciudad, id_aprendiz } = this._objAprendiz

      if (!nombre || !apellido || !documento || !correo || !ciudad || !id_aprendiz) {
        throw new Error("Faltan Campos Requeridos para Editar el Aprendiz.")
      }

      await con.execute("START TRANSACTION")

      const result = await con.execute(
        `UPDATE aprendiz SET nombre = ?, apellido = ?, documento = ?, correo = ?, ciudad = ? WHERE id_aprendiz = ?`,
        [nombre, apellido, documento, correo, ciudad, id_aprendiz],
      )

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        await con.execute("COMMIT")
        return { success: true, message: "Aprendiz Editado con Éxito!!!" }
      } else {
        throw new Error("No es Posible Editar el Aprendiz!!!")
      }
    } catch (error: unknown) {
      await con.execute("ROLLBACK")
      if (error instanceof z.ZodError) {
        return { success: false, message: error.message }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Error Interno del Servidor!!!"
        return { success: false, message: errorMessage }
      }
    }
  }

  public async EliminarAprendiz(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this._objAprendiz) {
        throw new Error("No se ha Proporcionado un Objeto de Aprendiz Válido!!!")
      }

      const { id_aprendiz } = this._objAprendiz

      if (!id_aprendiz) {
        throw new Error("Falta ID requerido para Eliminar el Aprendiz.")
      }

      await con.execute("START TRANSACTION")

      const result = await con.execute(`DELETE FROM aprendiz WHERE id_aprendiz = ?`, [id_aprendiz])

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        await con.execute("COMMIT")
        return { success: true, message: "Aprendiz Eliminado con Éxito!!!" }
      } else {
        throw new Error("No es Posible Eliminar el Aprendiz!!!")
      }
    } catch (error: unknown) {
      await con.execute("ROLLBACK")
      if (error instanceof z.ZodError) {
        return { success: false, message: error.message }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Error Interno del Servidor!!!"
        return { success: false, message: errorMessage }
      }
    }
  }

  public async insertarAprendicesMasivo(
    aprendices: AprendizData[],
  ): Promise<{ success: boolean; message: string; insertados: number; errores: string[] }> {
    let insertados = 0
    const errores: string[] = []

    try {
      await con.execute("START TRANSACTION")

      for (const aprendizData of aprendices) {
        try {
          const { nombre, apellido, documento, correo, ciudad } = aprendizData

          if (!nombre || !apellido || !documento || !correo || !ciudad) {
            errores.push(`Fila con documento ${documento || "sin documento"}: Faltan campos requeridos`)
            continue
          }

          const result = await con.execute(
            `INSERT INTO aprendiz (nombre, apellido, documento, correo, ciudad) VALUES (?,?,?,?,?)`,
            [nombre, apellido, documento, correo, ciudad],
          )

          if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
            insertados++
          } else {
            errores.push(`Error al insertar aprendiz con documento ${documento}`)
          }
        } catch (error) {
          errores.push(`Error en aprendiz con documento ${aprendizData.documento}: ${error.message}`)
        }
      }

      await con.execute("COMMIT")
      return {
        success: true,
        message: `Proceso completado. ${insertados} aprendices insertados.`,
        insertados,
        errores,
      }
    } catch (error) {
      await con.execute("ROLLBACK")
      return {
        success: false,
        message: "Error en la transacción masiva: " + error.message,
        insertados: 0,
        errores: [error.message],
      }
    }
  }
}
