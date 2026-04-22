import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
} from "./errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  const customErrorObject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
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
