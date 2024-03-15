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
  console.log(`Finished ${testInfo.title} with status ${testInfo.status}.`);

  if (testInfo.status !== testInfo.expectedStatus)
    console.log(`Did not run as expected.`);
});

// This test is able to authenticate on the Expense/Travis server and get the OAuth Token
// that can be used in further requests
test("Get expense/Travis API access_token", async ({ request, playwright }) => {
  const oauthResponse = await apiContext.post("/oauth/token?", {
    headers: {
      Accept: "application/json;charset=utf-8",
    },
    params: {
      grant_type: "client_credentials",
      scope:
        "public expense_reports.search expense_reports.confirm_export companies dimensions.view mileage_categories.read",
    },
  });

  expect(oauthResponse.ok()).toBeTruthy();

  const oauthData = await oauthResponse.json();
  const expenseToken = oauthData.access_token;
  const token_type = oauthData.token_type;

  const expenseResponse = await request.post(
    // TODO: Expense company ID will have to be made generic:
    // `https://api.staging.travis.no/companies/${expenseCompanyId}/generate_test_expenses`
    "https://api.staging.travis.no/companies/F4B80999-458D-40CB-A423-BC9E13284145/generate_test_expenses",
    {
      headers: {
        Accept: "application/json",
        Authorization: `${token_type} ${expenseToken}`,
      },
      params: {
        reports_per_employee: 2,
        expenses_per_report: 5,
        report_status: "approved",
      },
      data: {},
    }
  );

  console.log("EXPENSE RESPONSE: ", expenseResponse);
  expect(expenseResponse.ok()).toBeTruthy();
  const expenseData = await expenseResponse.json();
  console.log("EXPENSE DATA: ", expenseData);

  // TODO: for later:
  // const deleteResponse = await apiContext.delete('/companies/F4B80999-458D-40CB-A423-BC9E13284145',
  // {
  //   headers: {
  //     'Content-Type': 'charset=',
  //     Accept: "application/json;",
  //     Authorization: `${token_type} ${expenseToken}`,
  //   },
  // });
  // console.log(deleteResponse)
});
