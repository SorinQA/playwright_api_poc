import { test, expect } from "@playwright/test";
let randomGenerator = require("../helpers/randomNumberGenerator");
let nonStandardCprGenerator = require("../helpers/nonStandardCprGenerator");
let companyUserId;
let userEmploymentId;

const createIntectEmployees = async (
  apiContext,
  intectToken,
  companyId,
  employmentTemplateId
) => {
  await test.step("Create employees with employment inside the new Intect company", async () => {
    let randomNo = randomGenerator(10);
    let nonStandardCPR = nonStandardCprGenerator();

    const createEmployeeResponse = await apiContext.post(`/api/companyusers`, {
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
    });
    expect(createEmployeeResponse.ok()).toBeTruthy();
    const createEmployeeData = await createEmployeeResponse.json();

    companyUserId = createEmployeeData["Employment"].CompanyUserId;
    userEmploymentId = createEmployeeData["Employment"].Id;
  });
  return { companyUserId, userEmploymentId };
};

module.exports = createIntectEmployees;
