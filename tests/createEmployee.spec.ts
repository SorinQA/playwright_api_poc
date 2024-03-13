import { test, expect } from "@playwright/test";

let randomGenerator = require("../helpers/randomNumberGenerator");
let nonStandardCprGenerator = require("../helpers/nonStandardCprGenerator");

let token;
let companyId;
let employmentTemplateId;

test.beforeAll(async ({ request }) => {
  const response = await request.post("/api/auth/login");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  token = data.Token;
  companyId = data.CurrentCompany.Id;
  expect(data.Token).toBeTruthy();
});

test.afterEach(async ({ page }, testInfo) => {
  console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);

  if (testInfo.status !== testInfo.expectedStatus)
    console.log(`Did not run as expected, ended up at ${page.url()}`);
});

test("Create employee on company", async ({ request }) => {
  let randomNo = randomGenerator(10);
  let nonStandardCPR = nonStandardCprGenerator();

  // TODO: find a more generic way to get this:
  const employmentTemplatesResponse = await request.get(
    "/api/employmenttemplates",
    {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );
  const employmentTemplateData = await employmentTemplatesResponse.json();
  employmentTemplateId = employmentTemplateData[2].Id;

  const createEmployeeResponse = await request.post(`/api/companyusers`, {
    headers: {
      Accept: "application/json; charset=utf-8",
      Authorization: `Token ${token}`,
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
        LastName: `QA+${randomNo}}`,
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
  });

  expect(createEmployeeResponse.ok()).toBeTruthy();
  const createdEmployeeData = await createEmployeeResponse.json();
  // TODO: add assertions
});
