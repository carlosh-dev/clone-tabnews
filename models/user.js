import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors.js";
import password from "models/password";

async function create(userInputValues) {
  await validadeUniqueEmail(userInputValues);
  await validadeUniqueUserName(userInputValues);
  await hashPasswordInObject(userInputValues);

  console.log(userInputValues);

  const newUser = runInsertQuery(userInputValues);

  return newUser;
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;
}

async function validadeUniqueEmail(userInputValues) {
  const results = await database.query({
    text: `
    SELECT 
      email
    FROM 
      users
    WHERE
      LOWER(email) = LOWER($1)
    ;`,
    values: [userInputValues.email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email.",
    });
  }
}

async function validadeUniqueUserName(userInputValues) {
  const results = await database.query({
    text: `
    SELECT 
      username
    FROM 
      users
    WHERE
      LOWER(username) = LOWER($1)
    ;`,
    values: [userInputValues.username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O nome de usuário informado já está sendo utilizado.",
      action: "Utilize outro nome de usuário.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function runInsertQuery(userInputValues) {
  const results = await database.query({
    text: `
    INSERT INTO 
      users (username, email, password) 
    VALUES 
      ($1, $2, $3)
    RETURNING
      *
    ;`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });

  return results.rows[0];
}

async function runSelectQuery(username) {
  const results = await database.query({
    text: `
    SELECT 
      *
    FROM 
      users
    WHERE
      LOWER(username) = LOWER($1)
    LIMIT
      1
    ;`,
    values: [username],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o username.",
    });
  }

  return results.rows[0];
}

const user = {
  create,
  findOneByUsername,
};

export default user;
