import { test, expect } from "@playwright/test";

let apiContext;

const httpCredentials = {
  username: process.env.CLIENT_ID,
  password: process.env.CLIENT_SECRET,
};

const btoa = (str: string) => Buffer.from(str).toString("base64");
const credentialsBase64 = btoa(
  `${httpCredentials.username}:${httpCredentials.password}`
);

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: "https://api.staging.travis.no",
    extraHTTPHeaders: {
      Authorization: `Basic ${credentialsBase64}`,
    },
  });
});

test.afterAll(async ({}) => {
  await apiContext.dispose();
});

test.afterEach(async ({ page }, testInfo) => {
  console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);

  if (testInfo.status !== testInfo.expectedStatus)
    console.log(`Did not run as expected, ended up at ${page.url()}`);
});

// This test is able to authenticate on the Expense/Travis server and get the OAuth Token
// that can be used in further requests
test("Get expense/Travis API access_token", async () => {
  const oauthResponse = await apiContext.post("/oauth/token?", {
    headers: {
      Accept: "application/json; charset=utf-8",
    },
    params: {
      grant_type: "client_credentials",
      scope:
        "public expense_reports.search expense_reports.confirm_export companies dimensions.view mileage_categories.read",
    },
  });
  expect(oauthResponse.ok()).toBeTruthy();
  const oauthData = await oauthResponse.json();
  console.log('Expense auth access_token: ', oauthData.access_token)
});
