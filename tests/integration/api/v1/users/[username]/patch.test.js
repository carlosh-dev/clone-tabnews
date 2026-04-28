import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import password from "models/password";
import user from "models/user";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioInexistente",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const body = await response.json();

      expect(body).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o username.",
        statusCode: 404,
      });
    });

    test("With duplicated `username`", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: "senha123",
        }),
      });

      expect(user2Response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const body = await response.json();

      expect(body).toEqual({
        name: "ValidationError",
        message: "O nome de usuário informado já está sendo utilizado.",
        action: "Utilize outro nome de usuário.",
        statusCode: 400,
      });
    });

    test("With duplicated `email`", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@gmail.com",
          password: "senha123",
        }),
      });

      expect(user2Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "user1@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const body = await response.json();

      expect(body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email.",
        statusCode: 400,
      });
    });

    test("With unique `username`", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "unique1",
          email: "unique1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        id: body.id,
        username: "unique2",
        email: "unique1@gmail.com",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);

      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);
    });

    test("With unique `email`", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "unique1",
          email: "uniqueEmail1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        id: body.id,
        username: "unique1",
        email: "uniqueEmail2@gmail.com",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);

      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);
    });

    test("With new `password`", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword1",
          email: "newPassword1@gmail.com",
          password: "newPassword1",
        }),
      });

      expect(user1Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newPassword1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        id: body.id,
        username: "newPassword1",
        email: "newPassword1@gmail.com",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);

      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBe(true);

      const userInDataBase = await user.findOneByUsername("newPassword1");
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDataBase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newPassword3",
        userInDataBase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
