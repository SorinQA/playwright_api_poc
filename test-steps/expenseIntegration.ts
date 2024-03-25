import { test, expect } from "@playwright/test";

const expenseIntegration = async (apiContext, expenseCompanyId) => {
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
};

module.exports = expenseIntegration;
