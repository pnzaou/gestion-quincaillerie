export class HttpError extends Error {
  constructor(status = 500, message = "Erreur serveur") {
    super(message);
    this.status = status;
  }
}
