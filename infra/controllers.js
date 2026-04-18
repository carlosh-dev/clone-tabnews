import { InternalServerError, MethosNotAllowedError } from "./errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethosNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
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
