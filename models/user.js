import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors.js";
import password from "models/password";

async function create(userInputValues) {
  await validadeUniqueUserName(userInputValues.username);
  await validadeUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = runInsertQuery(userInputValues);

  return newUser;

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
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

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
}

async function update(userName, userInputValues) {
  const currentUser = await findOneByUsername(userName);

  if ("username" in userInputValues) {
    await validadeUniqueUserName(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validadeUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const result = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE 
        id = $1 
      RETURNING
        *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return result.rows[0];
  }
}

async function validadeUniqueEmail(email) {
  const results = await database.query({
    text: `
    SELECT 
      email
    FROM 
      users
    WHERE
      LOWER(email) = LOWER($1)
    ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email.",
    });
  }
}

async function validadeUniqueUserName(username) {
  const results = await database.query({
    text: `
    SELECT 
      username
    FROM 
      users
    WHERE
      LOWER(username) = LOWER($1)
    ;`,
    values: [username],
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

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
