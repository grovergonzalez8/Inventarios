export class Producto {
  constructor({ Codigo, Producto, Stock, UnidadMedida }) {
    this.codigo = Codigo;
    this.nombre = Producto;
    this.stock = Stock;
    this.unidadMedida = UnidadMedida;
  }
}