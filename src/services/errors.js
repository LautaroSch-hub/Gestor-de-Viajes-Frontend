// Error de la capa de servicios. "fields" lleva el detalle por campo en errores de validación
// ({ campo: 'mensaje' }); el servidor los devuelve con código 422.
export class ApiError extends Error {
  constructor(message, fields = null) {
    super(message)
    this.name = 'ApiError'
    this.fields = fields
  }
}
