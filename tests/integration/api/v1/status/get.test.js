import orchestrator from "tests/orchestrator";

beforeAll(async () => await orchestrator.waitForAllServices());

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependecies.database.version).toEqual("16.2");
      expect(responseBody.dependecies.database.max_connections).toEqual(100);
      expect(responseBody.dependecies.database.open_connections).toEqual(1);
    });
  });
});
