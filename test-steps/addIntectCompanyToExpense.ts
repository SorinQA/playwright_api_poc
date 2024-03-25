import { test, expect } from "@playwright/test";

let expenseCompanyId;
let data;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const addIntectCompanyToExpense = async (
  apiContext,
  intectToken,
  companyId
) => {
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

    await delay(10000);

    const expenseID = await apiContext.get(`api/companies/${companyId}`, {
      headers: {
        Accept: "application/json;",
        Authorization: `Token ${intectToken}`,
      },
    });

    expect(expenseID.ok()).toBeTruthy();
    data = await expenseID.json();
    expenseCompanyId = data.ExpenseId;
  });
  return { expenseCompanyId };
};

module.exports = addIntectCompanyToExpense;
