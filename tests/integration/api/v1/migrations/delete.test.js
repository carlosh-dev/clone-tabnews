import orchestrator from "tests/orchestrator"

beforeAll(async () => await orchestrator.waitForAllServices())

test("DELETE to /api/v1/migrations should not to be allowed", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "DELETE",
  });

  expect(response.status).toBe(405);

  const responseBody = await response.json();

  expect(responseBody.message).toBe(`Method "DELETE" now allowed!`);
});
