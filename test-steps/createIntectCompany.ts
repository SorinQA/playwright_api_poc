import { test, expect } from "@playwright/test";

let randomGenerator = require("../helpers/randomNumberGenerator");

let companyId;
let intectToken;
let employmentTemplateId;

const createIntectCompany = async (apiContext) => {
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
    return {employmentTemplateId, intectToken, companyId};
  }

  module.exports = createIntectCompany;