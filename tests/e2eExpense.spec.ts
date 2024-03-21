import { test, expect } from "@playwright/test";

const fs = require("fs").promises;

let randomGenerator = require("../helpers/randomNumberGenerator");
let nonStandardCprGenerator = require("../helpers/nonStandardCprGenerator");

let apiContext;
let companyId;
let intectToken;
let employmentTemplateId;
let companyUserId;
let userEmploymentId;
let expenseCompanyId;

let feature;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test.beforeAll(async ({ playwright }) => {
  feature = await fs.readFile("1_login.feature", () => {});
  console.log(feature.toString());

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
    await test.step("Create new Intect company", async () => {
      let secondaryVatNo = randomGenerator(8);

      const signupResponse = await apiContext.post(`/api/companies/signup`, {
        data: {
          VatRegistrationNumber: "29831084",
          SecondaryVatRegistrationNumber: `${secondaryVatNo}`,
          CompanyName: `New Company ${secondaryVatNo}`,
          ResponsibleUserUsername: "",
          ResponsibleUserIdentityNumber: "",
          ResponsibleUserFullName: "Sorin",
          ResponsibleUserEmail: `svd+${secondaryVatNo}@intect.io`,
          PhoneNumber: "",
          LanguageId: 2,
          KnowsIntectFrom: "",
          NewUserPassword: "Sorintest9!",
          SubscribeToNewsLetter: true,
          AcceptStartupOffer: false,
          PackageLevel: 2,
          NewAccountName: "QA 123",
          AccountTypeId: 0,
        },
      });

      expect(signupResponse.ok()).toBeTruthy();

      const signupData = await signupResponse.json();
      companyId = signupData.Id;

      const loginResponse = await apiContext.post("/api/auth/login", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          Authorization: `Basic ${btoa(
            `svd+${secondaryVatNo}@intect.io:Sorintest9!`
          )}`,
        },
      });

      expect(loginResponse.ok()).toBeTruthy();

      const loginData = await loginResponse.json();
      intectToken = loginData.Token;

      await apiContext.put("/api/preferences/company", {
        headers: {
          Accept: "application/json",
          Authorization: `Token ${intectToken}`,
        },
        data: {
          Key: "CPR.BypassModulo11Check",
          Value: "true",
        },
      });

      const employmentTemplatesResponse = await apiContext.get(
        "/api/employmenttemplates",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Token ${intectToken}`,
          },
        }
      );

      const employmentTemplateData = await employmentTemplatesResponse.json();
      employmentTemplateId = employmentTemplateData[2].Id;
    });

    await test.step("Create employees with employment inside the new Intect company", async () => {
      let randomNo = randomGenerator(10);
      let nonStandardCPR = nonStandardCprGenerator();

      const createEmployeeResponse = await apiContext.post(
        `/api/companyusers`,
        {
          headers: {
            Accept: "application/json; charset=utf-8",
            Authorization: `Token ${intectToken}`,
          },
          data: {
            Details: {
              Address: {
                CountryId: 1,
              },
              CompanyId: `${companyId}`,
              IsActive: true,
              RoleId: 20,
              FirstName: `Test+${randomNo}`,
              LastName: `QA+${randomNo}`,
              CompanyEmail: `test+${randomNo}@gmail.com`,
            },
            Title: "Medarbejder",
            HireDate: "2024-03-12T00:00:00.000Z",
            LanguageId: 1,
            TaxCardTypeId: 1,
            TaxColumnNumber: 1,
            EmploymentTemplateId: `${employmentTemplateId}`,
            IdentityNumber: `${nonStandardCPR}`,
          },
        }
      );
      expect(createEmployeeResponse.ok()).toBeTruthy();
      const createEmployeeData = await createEmployeeResponse.json();

      companyUserId = createEmployeeData["Employment"].CompanyUserId;
      userEmploymentId = createEmployeeData["Employment"].Id;
    });

    await test.step("Add the Intect company to Expense", async () => {
      const addIntectCompanyToExpense = await apiContext.post(
        `api/expense/companies/${companyId}`,
        {
          headers: {
            Accept: "application/json;",
            Authorization: `Token ${intectToken}`,
          },
        }
      );

      expect(addIntectCompanyToExpense.ok()).toBeTruthy();

      await delay(5000);

      const expenseID = await apiContext.get(`api/companies/${companyId}`, {
        headers: {
          Accept: "application/json;",
          Authorization: `Token ${intectToken}`,
        },
      });

      expect(expenseID.ok()).toBeTruthy();
      let data = await expenseID.json();
      expenseCompanyId = data.ExpenseId;
    });

    await test.step("Add the Intect employee to Expense", async () => {
      const expenseID = await apiContext.post(
        `/api/expense/companieUser/${companyUserId}`,
        {
          headers: {
            Accept: "application/json;",
            Authorization: `Token ${intectToken}`,
          },
        }
      );

      expect(expenseID.ok()).toBeTruthy();
    });

    await test.step("Expense integration", async () => {
      const httpCredentials = {
        username: "P-EUBU2Zbn668ldC4bDhQQwAAcjaqfl-s-FLqxlbDd8",
        password: "jSxmnM7EBLK60miw_kbKCTxAQBIR7qyfIH7m712GBbQ",
      };

      const btoa = (str: string) => Buffer.from(str).toString("base64");
      const credentialsBase64 = btoa(
        `${httpCredentials.username}:${httpCredentials.password}`
      );

      const oauthResponse = await apiContext.post(
        "https://api.staging.travis.no/oauth/token?",
        {
          headers: {
            Authorization: `Basic ${credentialsBase64}`,
          },
          params: {
            grant_type: "client_credentials",
            scope:
              "public expense_reports.search expense_reports.confirm_export companies dimensions.view mileage_categories.read",
          },
        }
      );

      expect(oauthResponse.ok()).toBeTruthy();

      const oauthData = await oauthResponse.json();
      const expenseToken = oauthData.access_token;
      const token_type = oauthData.token_type;

      const makeCompanyTestResponse = await apiContext.patch(
        `https://api.staging.travis.no/companies/${expenseCompanyId}?company[test]=true`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `${token_type} ${expenseToken}`,
          },
        }
      );
      expect(makeCompanyTestResponse.ok()).toBeTruthy();

      const expenseResponse = await apiContext.post(
        `https://api.staging.travis.no/companies/${expenseCompanyId}/generate_test_expenses`,
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

      expect(expenseResponse.ok()).toBeTruthy();
    });

    await test.step("Import expenses to Intect", async () => {
      const importedResp = await apiContext.get(
        `api/expense/import/${companyId}`,
        {
          headers: {
            Accept: "application/json;",
            Authorization: `Token ${intectToken}`,
          },
        }
      );

      expect(importedResp.ok()).toBeTruthy();

      await delay(5000);
      const salaryStatementsRsp = await apiContext.get(
        `api/salaryrecords/employment/${userEmploymentId}`,
        {
          headers: {
            Accept: "application/json;",
            Authorization: `Token ${intectToken}`,
          },
        }
      );

      expect(salaryStatementsRsp.ok()).toBeTruthy();
      let statementsData = await salaryStatementsRsp.json();
      expect(statementsData.length).toBe(11); // 10 (5x2) + 1 pre-existent
    });
  });
});
