import { test, expect } from "@playwright/test";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const importExpensesToIntect = async (
  apiContext,
  intectToken,
  companyId,
  userEmploymentId
) => {
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
  
        await delay(10000);
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
};

module.exports = importExpensesToIntect;
