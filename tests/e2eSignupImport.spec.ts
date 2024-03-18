import { test, expect } from "@playwright/test";
const fs = require("fs");

let randomGenerator = require("../helpers/randomNumberGenerator");
let apiContext;
let secondaryVatNo;
let token;
let importMappingId;

test.beforeEach(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: `https://${process.env.INTECT_ENVIRONMENT}.testintect.app/`,
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

test("Check signing up new company & importing employees on Intect", async () => {
  // SIGNUP NEW COMPANY
  secondaryVatNo = randomGenerator(8);

  const signupResponse = await apiContext.post(`/api/companies/signup`, {
    data: {
      VatRegistrationNumber: "29831084",
      SecondaryVatRegistrationNumber: `${secondaryVatNo}`,
      CompanyName: `Test Company ${secondaryVatNo}`,
      ResponsibleUserUsername: "",
      ResponsibleUserIdentityNumber: "",
      ResponsibleUserFullName: `Test Automation ${secondaryVatNo}`,
      ResponsibleUserEmail: `svd+${secondaryVatNo}@intect.io`,
      PhoneNumber: "",
      LanguageId: 2,
      KnowsIntectFrom: "",
      NewUserPassword: "Sorintest9!",
      SubscribeToNewsLetter: true,
      AcceptStartupOffer: false,
      PackageLevel: 2,
      NewAccountName: `QA ${secondaryVatNo}`,
      AccountTypeId: 0,
    },
  });

  console.log("SIGNUP RESPONSE: ", signupResponse);

  expect(signupResponse.ok()).toBeTruthy();
  const signupData = await signupResponse.json();
  console.log("SIGNUP DATA: ", signupData);
  // TODO: add assertions

  // LOGIN & GET THE TOKEN
  const response = await apiContext.post("/api/auth/login", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      Authorization: `Basic ${btoa(
        `svd+${secondaryVatNo}@intect.io:Sorintest9!`
      )}`,
    },
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  token = data.Token;
  console.log("TOKEN: ", token);

  // ENABLE BYPASS STANDARD CPR SETTING
  await apiContext.put("/api/preferences/company", {
    headers: {
      Accept: "application/json",
      Authorization: `Token ${token}`,
    },
    data: {
      Key: "CPR.BypassModulo11Check",
      Value: "true",
    },
  });

  // GET THE IMPORT MAPPING ID
  const getMappingIds = await apiContext.get("api/importmapping", {
    headers: {
      Accept: "application/json; charset=utf-8",
      Authorization: `Token ${token}`,
    },
  });

  const mappingIdsData = await getMappingIds.json();
  importMappingId = mappingIdsData[1].Id;

  // IMPORT EMPLOYEES
  const fileDataBase64 = fs.readFileSync(
    "./test-files/StandardMapping (100).xlsx",
    "base64"
  );

  const importResponse = await apiContext.post("/api/import", {
    headers: {
      Accept: "application/json; charset=utf-8",
      Authorization: `Token ${token}`,
    },
    data: {
      AccountId: null,
      FileBase64: `${fileDataBase64}`,
      MappingId: `${importMappingId}`, // This value changes on deployment of a new Intect app version.ss
      Options: [
        {
          Key: "save",
          Value: "always",
        },
        {
          Key: "Change",
          Value: "Upsert",
        },
      ],
    },
  });

  console.log("Import response: ", importResponse);

  expect(importResponse.ok()).toBeTruthy();
  const importResJSON = await importResponse.json();

  console.log("Import response data: ", importResJSON);
  console.log("Errors: ", importResJSON["Errors"]);
  console.log("Errors lentgh: ", importResJSON["Errors"].length);

  expect(importResJSON["Errors"].length).toBe(0);
});
