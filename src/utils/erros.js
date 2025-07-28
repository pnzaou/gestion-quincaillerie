
export class SaleValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "SaleValidationError";
  }
}
