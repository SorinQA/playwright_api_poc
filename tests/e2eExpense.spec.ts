import { test } from "@playwright/test";

let createIntectCompany = require("../test-steps/createIntectCompany");
let createIntectEmployees = require("../test-steps/createIntectEmployees");
let addIntectCompanyToExpense = require("../test-steps/addIntectCompanyToExpense");
let addIntectEmployeeToExpense = require("../test-steps/addIntectEmployeeToExpense");
let expenseIntegration = require("../test-steps/expenseIntegration");
let importExpensesToIntect = require("../test-steps/importExpensesToIntect");

let apiContext;
let companyId;
let intectToken;
let employmentTemplateId;
let companyUserId;
let userEmploymentId;
let expenseCompanyId;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    // baseURL: `https://${process.env.INTECT_ENVIRONMENT}.testintect.app/`,
    baseURL: `https://closure3api.testintect.app/`,
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

test.describe("E2E Intect app - Expense app integration flow", async () => {
  test("Check if the expenses can be retrieved and imported in the Intect app", async () => {
    const companyData = await createIntectCompany(apiContext);

    intectToken = companyData.intectToken;
    employmentTemplateId = companyData.employmentTemplateId;
    companyId = companyData.companyId;

    const employeeData = await createIntectEmployees(
      apiContext,
      intectToken,
      companyId,
      employmentTemplateId
    );
    companyUserId = employeeData.companyUserId;
    userEmploymentId = employeeData.userEmploymentId;

    const expenseData = await addIntectCompanyToExpense(
      apiContext,
      intectToken,
      companyId
    );

    expenseCompanyId = expenseData.expenseCompanyId;

    await addIntectEmployeeToExpense(apiContext, intectToken, companyUserId);

    await expenseIntegration(apiContext, expenseCompanyId);

    await importExpensesToIntect(
      apiContext,
      intectToken,
      companyId,
      userEmploymentId
    );
  });
});
