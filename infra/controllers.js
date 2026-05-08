import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorazedError,
  ValidationError,
} from "./errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorazedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const customErrorObject = new InternalServerError({
    cause: error,
  });

  console.log(customErrorObject);

  response.status(customErrorObject.statusCode).json({
    error: customErrorObject,
  });
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
