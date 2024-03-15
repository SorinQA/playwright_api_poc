import { test, expect } from "@playwright/test";

let randomGenerator = require("../helpers/randomNumberGenerator");

let apiContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: "https://api.testintect.app/",
    extraHTTPHeaders: {
      "Content-type": "application/json",
    },
  });
});

test.afterAll(async ({}) => {
  await apiContext.dispose();
});

test.afterEach(async ({ page }, testInfo) => {
  console.log(`Finished ${testInfo.title} with status ${testInfo.status}.`);

  if (testInfo.status !== testInfo.expectedStatus)
    console.log(`Did not run as expected.`);
});

test("Signup company on Intect", async () => {
  let secondaryVatNo = randomGenerator(8);

  const signupResponse = await apiContext.post(`/api/companies/signup`, {
    data: {
      VatRegistrationNumber: "29831084",
      SecondaryVatRegistrationNumber: `${secondaryVatNo}`,
      CompanyName: `Test Company ${secondaryVatNo}`,
      ResponsibleUserUsername: "",
      ResponsibleUserIdentityNumber: "",
      ResponsibleUserFullName: `Test Automation ${secondaryVatNo}`,
      ResponsibleUserEmail: `svd+${secondaryVatNo}@intect.io`,
      PhoneNumber: "",
      LanguageId: 2,
      KnowsIntectFrom: "",
      NewUserPassword: "Sorintest9!",
      SubscribeToNewsLetter: true,
      AcceptStartupOffer: false,
      PackageLevel: 2,
      NewAccountName: `QA ${secondaryVatNo}`,
      AccountTypeId: 0,
    },
  });
  console.log("SIGNUP RESPONSE: ", signupResponse);
  expect(signupResponse.ok()).toBeTruthy();
  const signupData = await signupResponse.json();
  console.log("SIGNUP DATA: ", signupData);
  // TODO: add assertions
});
