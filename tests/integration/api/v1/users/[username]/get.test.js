import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match`", async () => {
      await orchestrator.createUser({
        username: "mesmoCase",
        email: "email@gmail.com",
        password: "senha123",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/mesmoCase",
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        id: body.id,
        username: "mesmoCase",
        email: "email@gmail.com",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);

      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });

    test("With case mismatch`", async () => {
      await orchestrator.createUser({
        username: "CaseDiferente",
        email: "casediferente@gmail.com",
        password: "senha123",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      expect(response.status).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        id: body.id,
        username: "CaseDiferente",
        email: "casediferente@gmail.com",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);

      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username`", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioInexistente",
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
  });
});
