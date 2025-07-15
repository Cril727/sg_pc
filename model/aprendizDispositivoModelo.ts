//deno-lint-ignore-file
import { con } from "./Conexion.ts"
import { z } from "../dependencies/depnedencies.ts"

interface AsignacionData {
  id_aprendiz: number | null
  id_computador: number | null
}

interface AsignacionCompleta {
  id_aprendiz: number
  id_computador: number
  nombre_aprendiz: string
  apellido_aprendiz: string
  documento_aprendiz: string
  correo_aprendiz: string
  ciudad_aprendiz: string
  marca_computador: string
  modelo_computador: string
  serial_computador: string
  fecha_adquisicion: string
  estado_computador: string
  foto_computador: string
}

export class AprendizDispositivo {
  public _objAsignacion: AsignacionData | null

  constructor(objAsignacion: AsignacionData | null = null) {
    this._objAsignacion = objAsignacion
  }

  public async SeleccionarAsignaciones(): Promise<AsignacionCompleta[]> {
    const { rows: asignaciones } = await con.execute(`
            SELECT 
                a.id_aprendiz,
                a.id_computador,
                ap.nombre as nombre_aprendiz,
                ap.apellido as apellido_aprendiz,
                ap.documento as documento_aprendiz,
                ap.correo as correo_aprendiz,
                ap.ciudad as ciudad_aprendiz,
                c.marca as marca_computador,
                c.modelo as modelo_computador,
                c.serial as serial_computador,
                c.fecha_adquisicion,
                c.estado as estado_computador,
                c.foto as foto_computador
            FROM asignacion a
            INNER JOIN aprendiz ap ON a.id_aprendiz = ap.id_aprendiz
            INNER JOIN computador c ON a.id_computador = c.id_computador
        `)
    return asignaciones as AsignacionCompleta[]
  }

  public async SeleccionarAsignacionPorAprendiz(id_aprendiz: number): Promise<AsignacionCompleta[]> {
    const { rows: asignaciones } = await con.execute(
      `
            SELECT 
                a.id_aprendiz,
                a.id_computador,
                ap.nombre as nombre_aprendiz,
                ap.apellido as apellido_aprendiz,
                ap.documento as documento_aprendiz,
                ap.correo as correo_aprendiz,
                ap.ciudad as ciudad_aprendiz,
                c.marca as marca_computador,
                c.modelo as modelo_computador,
                c.serial as serial_computador,
                c.fecha_adquisicion,
                c.estado as estado_computador,
                c.foto as foto_computador
            FROM asignacion a
            INNER JOIN aprendiz ap ON a.id_aprendiz = ap.id_aprendiz
            INNER JOIN computador c ON a.id_computador = c.id_computador
            WHERE a.id_aprendiz = ?
        `,
      [id_aprendiz],
    )
    return asignaciones as AsignacionCompleta[]
  }

  public async insertarAsignacion(): Promise<{
    success: boolean
    message: string
    Asignacion?: Record<string, unknown>
  }> {
    try {
      if (!this._objAsignacion) {
        throw new Error("No se ha Proporcionado un Objeto de Asignación Válido!!!")
      }

      const { id_aprendiz, id_computador } = this._objAsignacion

      if (!id_aprendiz || !id_computador) {
        throw new Error("Faltan Campos Requeridos para Insertar la Asignación.")
      }

      // Verificar que el aprendiz existe
      const { rows: aprendizExiste } = await con.execute(`SELECT id_aprendiz FROM aprendiz WHERE id_aprendiz = ?`, [
        id_aprendiz,
      ])

      if (!aprendizExiste || aprendizExiste.length === 0) {
        throw new Error("El aprendiz especificado no existe.")
      }

      // Verificar que el computador existe
      const { rows: computadorExiste } = await con.execute(
        `SELECT id_computador FROM computador WHERE id_computador = ?`,
        [id_computador],
      )

      if (!computadorExiste || computadorExiste.length === 0) {
        throw new Error("El computador especificado no existe.")
      }

      // Verificar que la asignación no existe ya
      const { rows: asignacionExiste } = await con.execute(
        `SELECT * FROM asignacion WHERE id_aprendiz = ? AND id_computador = ?`,
        [id_aprendiz, id_computador],
      )

      if (!asignacionExiste || asignacionExiste.length > 0) {
        throw new Error("Esta asignación ya existe.")
      }

      await con.execute("START TRANSACTION")

      const result = await con.execute(`INSERT INTO asignacion (id_aprendiz, id_computador) VALUES (?,?)`, [
        id_aprendiz,
        id_computador,
      ])

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        const [Asignacion] = await con.query(
          `
                    SELECT 
                        a.id_aprendiz,
                        a.id_computador,
                        ap.nombre as nombre_aprendiz,
                        ap.apellido as apellido_aprendiz,
                        c.marca as marca_computador,
                        c.modelo as modelo_computador,
                        c.serial as serial_computador
                    FROM asignacion a
                    INNER JOIN aprendiz ap ON a.id_aprendiz = ap.id_aprendiz
                    INNER JOIN computador c ON a.id_computador = c.id_computador
                    WHERE a.id_aprendiz = ? AND a.id_computador = ?
                `,
          [id_aprendiz, id_computador],
        )

        await con.execute("COMMIT")
        return { success: true, message: "Asignación Registrada con Éxito!!!", Asignacion: Asignacion }
      } else {
        throw new Error("No es Posible Registrar la Asignación!!!")
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

  public async EliminarAsignacion(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this._objAsignacion) {
        throw new Error("No se ha Proporcionado un Objeto de Asignación Válido!!!")
      }

      const { id_aprendiz, id_computador } = this._objAsignacion

      if (!id_aprendiz || !id_computador) {
        throw new Error("Faltan IDs requeridos para Eliminar la Asignación.")
      }

      await con.execute("START TRANSACTION")

      const result = await con.execute(`DELETE FROM asignacion WHERE id_aprendiz = ? AND id_computador = ?`, [
        id_aprendiz,
        id_computador,
      ])

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        await con.execute("COMMIT")
        return { success: true, message: "Asignación Eliminada con Éxito!!!" }
      } else {
        throw new Error("No es Posible Eliminar la Asignación!!!")
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

  public async insertarAsignacionesMasivas(
    asignaciones: AsignacionData[],
  ): Promise<{ success: boolean; message: string; insertados: number; errores: string[] }> {
    let insertados = 0
    const errores: string[] = []

    try {
      await con.execute("START TRANSACTION")

      for (const asignacionData of asignaciones) {
        try {
          const { id_aprendiz, id_computador } = asignacionData

          if (!id_aprendiz || !id_computador) {
            errores.push(`Asignación con IDs ${id_aprendiz}-${id_computador}: Faltan campos requeridos`)
            continue
          }

          // Verificar que no existe ya la asignación
          const { rows: existe } = await con.execute(
            `SELECT * FROM asignacion WHERE id_aprendiz = ? AND id_computador = ?`,
            [id_aprendiz, id_computador],
          )

          // @ts-ignore
          if (existe.length > 0) {
            errores.push(`Asignación ${id_aprendiz}-${id_computador}: Ya existe`)
            continue
          }

          const result = await con.execute(`INSERT INTO asignacion (id_aprendiz, id_computador) VALUES (?,?)`, [
            id_aprendiz,
            id_computador,
          ])

          if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
            insertados++
          } else {
            errores.push(`Error al insertar asignación ${id_aprendiz}-${id_computador}`)
          }
        } catch (error:any) {
          errores.push(
            `Error en asignación ${asignacionData.id_aprendiz}-${asignacionData.id_computador}: ${error.message}`,
          )
        }
      }

      await con.execute("COMMIT")
      return {
        success: true,
        message: `Proceso completado. ${insertados} asignaciones insertadas.`,
        insertados,
        errores,
      }
    } catch (error:any) {
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
