import { test, expect } from "@playwright/test";

let token;
let requestResponse;
let requestResponseData;

const optionalColumns = require("../test-data/SalaryTotalsOptionalColumns.json");

test.beforeAll(async ({ request }) => {
  const response = await request.post("/api/auth/login");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  token = data.Token;
  expect(data.Token).toBeTruthy();
});

test.afterEach(async ({}) => {
  console.log("RESPONSE: ", requestResponse);
  console.log("RESPONSE DATA: ", requestResponseData);
});

for (const column of optionalColumns) {
  test(`Check Salary totals with param ${column["Value"]}`, async ({
    request,
  }) => {
    let payload = {
      ReportId: 1,
      ParameterValues: [
        {
          Key: "SalaryBatchIdWithoutSalaryStatements",
          Value: 201858,
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

    requestResponse = await request.post("/api/reports/html", {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
      },
      data: payload,
    });

    expect(requestResponse.ok()).toBeTruthy();
    requestResponseData = await requestResponse.json();
  });
}
