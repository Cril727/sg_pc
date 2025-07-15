//deno-lint-ignore-file
import { con } from "./Conexion.ts"
import { z } from "../dependencies/depnedencies.ts"

interface DispositivoData {
  id_computador: number | null
  marca: string | null
  modelo: string | null
  serial: string | null
  fecha_adquisicion: string | null
  estado: string | null
  foto: string | null
}

export class Dispositivo {
  public _objDispositivo: DispositivoData | null
  public _idDispositivo: number | null

  constructor(objDispositivo: DispositivoData | null = null, idDispositivo: number | null = null) {
    this._objDispositivo = objDispositivo
    this._idDispositivo = idDispositivo
  }

  public async SeleccionarDispositivo(): Promise<DispositivoData[]> {
    const { rows: dispositivos } = await con.execute(`SELECT * FROM computador`)
    return dispositivos as DispositivoData[]
  }

  public async SeleccionarDispositivoPorId(): Promise<DispositivoData | null> {
    if (!this._idDispositivo) {
      throw new Error("ID de Dispositivo requerido")
    }
    const { rows: dispositivos } = await con.execute(`SELECT * FROM computador WHERE id_computador = ?`, [
      this._idDispositivo,
    ])

    // @ts-ignore
    return dispositivos.length > 0 ? (dispositivos[0] as DispositivoData) : null
  }

  public async insertarDispositivo(): Promise<{
    success: boolean
    message: string
    Dispositivo?: Record<string, unknown>
  }> {
    try {
      if (!this._objDispositivo) {
        throw new Error("No se ha Proporcionado un Objeto de Dispositivo Válido!!!")
      }

      const { marca, modelo, serial, fecha_adquisicion, estado, foto } = this._objDispositivo

      if (!marca || !modelo || !serial || !fecha_adquisicion || !estado) {
        throw new Error("Faltan Campos Requeridos para Insertar el Dispositivo.")
      }

      await con.execute("START TRANSACTION")

      const result = await con.execute(
        `INSERT INTO computador (marca, modelo, serial, fecha_adquisicion, estado, foto) VALUES (?,?,?,?,?,?)`,
        [marca, modelo, serial, fecha_adquisicion, estado, foto || null],
      )

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        const [Dispositivo] = await con.query(`SELECT * FROM computador WHERE id_computador = LAST_INSERT_ID()`)

        await con.execute("COMMIT")
        return { success: true, message: "Dispositivo Registrado con Éxito!!!", Dispositivo: Dispositivo }
      } else {
        throw new Error("No es Posible Registrar el Dispositivo!!!")
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

  public async EditarDispositivo(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this._objDispositivo) {
        throw new Error("No se ha Proporcionado un Objeto de Dispositivo Válido!!!")
      }

      const { marca, modelo, serial, fecha_adquisicion, estado, foto, id_computador } = this._objDispositivo

      if (!marca || !modelo || !serial || !fecha_adquisicion || !estado || !id_computador) {
        throw new Error("Faltan Campos Requeridos para Editar el Dispositivo.")
      }

      await con.execute("START TRANSACTION")

      const result = await con.execute(
        `UPDATE computador SET marca = ?, modelo = ?, serial = ?, fecha_adquisicion = ?, estado = ?, foto = ? WHERE id_computador = ?`,
        [marca, modelo, serial, fecha_adquisicion, estado, foto, id_computador],
      )

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        await con.execute("COMMIT")
        return { success: true, message: "Dispositivo Editado con Éxito!!!" }
      } else {
        throw new Error("No es Posible Editar el Dispositivo!!!")
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

  public async EliminarDispositivo(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this._objDispositivo) {
        throw new Error("No se ha Proporcionado un Objeto de Dispositivo Válido!!!")
      }

      const { id_computador } = this._objDispositivo

      if (!id_computador) {
        throw new Error("Falta ID requerido para Eliminar el Dispositivo.")
      }

      // Obtener la foto antes de eliminar para borrar el archivo
      const dispositivoExistente = await this.SeleccionarDispositivoPorId()

      await con.execute("START TRANSACTION")

      const result = await con.execute(`DELETE FROM computador WHERE id_computador = ?`, [id_computador])

      if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
        await con.execute("COMMIT")

        // Eliminar archivo de foto si existe
        if (dispositivoExistente && dispositivoExistente.foto) {
          try {
            await Deno.remove(dispositivoExistente.foto)
          } catch (deleteError: unknown) {
            console.warn("Error al eliminar archivo de foto:", deleteError)
          }
        }

        return { success: true, message: "Dispositivo Eliminado con Éxito!!!" }
      } else {
        throw new Error("No es Posible Eliminar el Dispositivo!!!")
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

  public async insertarDispositivosMasivo(
    dispositivos: DispositivoData[],
  ): Promise<{ success: boolean; message: string; insertados: number; errores: string[] }> {
    let insertados = 0
    const errores: string[] = []

    try {
      await con.execute("START TRANSACTION")

      for (const dispositivoData of dispositivos) {
        try {
          const { marca, modelo, serial, fecha_adquisicion, estado, foto } = dispositivoData

          if (!marca || !modelo || !serial || !fecha_adquisicion || !estado) {
            errores.push(`Fila con serial ${serial || "sin serial"}: Faltan campos requeridos`)
            continue
          }

          const result = await con.execute(
            `INSERT INTO computador (marca, modelo, serial, fecha_adquisicion, estado, foto) VALUES (?,?,?,?,?,?)`,
            [marca, modelo, serial, fecha_adquisicion, estado, foto || null],
          )

          if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
            insertados++
          } else {
            errores.push(`Error al insertar dispositivo con serial ${serial}`)
          }
        } catch (error:any) {
          errores.push(`Error en dispositivo con serial ${dispositivoData.serial}: ${error.message}`)
        }
      }

      await con.execute("COMMIT")
      return {
        success: true,
        message: `Proceso completado. ${insertados} dispositivos insertados.`,
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
