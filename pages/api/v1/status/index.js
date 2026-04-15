import { createRouter } from "next-connect";
import database from "infra/database.js";
import { InternalServerError, MethosNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(getHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethosNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  const customErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\n Erro dentro do next-connect:");
  console.log(customErrorObject);

  response.status(500).json({
    error: customErrorObject,
  });
}

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const databateVersionResult = await database.query("SHOW server_version;");
  const version = databateVersionResult.rows[0].server_version;

  const databateMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const maxConnections = databateMaxConnectionsResult.rows[0].max_connections;

  const databateOpennedConnextionsResult = await database.query(
    `SELECT COUNT(*)::int FROM pg_stat_activity  WHERE datname = '${process.env.POSTGRES_DB}';`,
  );
  const databaseOpenConnectionsValue =
    databateOpennedConnextionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependecies: {
      database: {
        max_connections: parseInt(maxConnections),
        open_connections: databaseOpenConnectionsValue,
        version: version,
      },
    },
  });
}
