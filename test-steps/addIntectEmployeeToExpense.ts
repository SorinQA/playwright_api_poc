import { test, expect } from "@playwright/test";

const addIntectEmployeeToExpense = async (
  apiContext,
  intectToken,
  companyUserId
) => {
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
};

module.exports = addIntectEmployeeToExpense;
