import database from "infra/database.js";

async function status(request, response) {
  
  const updatedAt = new Date().toISOString();

  const databateVersionResult = await database.query("SHOW server_version;");
  const version = databateVersionResult.rows[0].server_version;
  
  const databateMaxConnextionsResult = await database.query("SHOW max_connections;");
  const maxConnections = databateMaxConnextionsResult.rows[0].max_connections;

  const databateOpennedConnextionsResult = await database.query("SELECT COUNT(*)::int FROM pg_stat_activity  WHERE datname = 'local_bd';");
  const databaseOpenConnectionsValue = databateOpennedConnextionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependecies: {
      database: {
        max_connections: parseInt(maxConnections),
        open_connections: databaseOpenConnectionsValue,
        version: version
      }
    }
  })
}

export default status;