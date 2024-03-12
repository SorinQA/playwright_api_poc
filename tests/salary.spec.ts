import { test, expect } from "@playwright/test";

let token;
let requestResponse;

const optionalColumns = require("../test-data/SalaryTotalsOptionalColumns.json");

test.beforeAll(async ({ request }) => {
  const response = await request.post("/api/auth/login");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  token = data.Token;
  expect(data.Token).toBeTruthy();
});

test.afterAll(async ({ }) => {
  console.log(requestResponse)
});



for (const column of optionalColumns) {
  test(`Check Salary totals with param ${column["Value"]}`, async ({
    request,
  }) => {
    let myData = {
      ReportId: 1,
      ParameterValues: [
        {
          Key: "SalaryBatchIdWithoutSalaryStatements",
          Value: 201858,
          // Value: 191731,
        },
        {
          Key: "SalaryTotalsGroup",
          Value: 1,
        },
        column,
        {
          Key: "Preview",
          Value: "999",
        },
      ],
    };

    const response = await request.post("/api/reports/html", {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
      },
      data: myData,
    });
    
    requestResponse = response;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
  });
}