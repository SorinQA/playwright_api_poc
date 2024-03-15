import { test, expect } from "@playwright/test";

test.describe("Intect login module", () => {
  test("Login with valid credentials", async ({ request }) => {
    const loginResponse = await request.post(`https://${process.env.INTECT_ENVIRONMENT}.testintect.app//api/auth/login`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          Authorization: `Basic ${btoa("svd@intect.io:Sorintest9!")}`,
        },
      }
    );
    console.log("Valid login response: ", loginResponse);
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    console.log("Login data: ", loginData);
    expect(loginData.CurrentCompany.Id).toEqual(6388);
    expect(loginData.CurrentCompany.Name).toEqual("SorinTestCompany");
    expect(loginData.CurrentCompany.Email1).toEqual("svd@intect.io");
  });

  test("Login with invalid credentials", async ({ request }) => {
    const loginResponse = await request.post(
      `https://${process.env.INTECT_ENVIRONMENT}.testintect.app//api/auth/login`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          Authorization: `Basic ${btoa("svd@intect.io:Sorintest")}`,
        },
      }
    );
    console.log("Invalid login response: ", loginResponse);
    expect(loginResponse.ok()).not.toBeTruthy();
  });
});
