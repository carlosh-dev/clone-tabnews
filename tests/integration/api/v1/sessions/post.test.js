import session from "models/session";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect.email@gmail.com",
          password: "correct-password",
        }),
      });

      expect(response.status).toEqual(401);

      const body = await response.json();

      expect(body).toEqual({
        name: "UnauthorazedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados estão corretos.",
        statusCode: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "correct.email@email.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct.email@email.com",
          password: "incorrect-password",
        }),
      });

      expect(response.status).toEqual(401);

      const body = await response.json();

      expect(body).toEqual({
        name: "UnauthorazedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados estão corretos.",
        statusCode: 401,
      });
    });

    test("With incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect.email@email.com",
          password: "incorrect-password",
        }),
      });

      expect(response.status).toEqual(401);

      const body = await response.json();

      expect(body).toEqual({
        name: "UnauthorazedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados estão corretos.",
        statusCode: 401,
      });
    });

    test("With correct `email` and correct `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "all.correct.email@email.com",
        password: "correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "all.correct.email@email.com",
          password: "correct-password",
        }),
      });

      expect(response.status).toEqual(201);

      const body = await response.json();

      expect(body).toEqual({
        id: body.id,
        token: body.token,
        user_id: createdUser.id,
        expires_at: body.expires_at,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.expires_at)).not.toBeNaN();
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();

      const expiresAt = new Date(body.expires_at);
      const createdAt = new Date(body.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(response, { map: true });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: body.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
