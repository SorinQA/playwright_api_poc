import { test, expect } from '@playwright/test';

let apiContext;

function getRandom(length) {
  return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
}

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: 'https://api.testintect.app/',
    extraHTTPHeaders: {
      'Content-type': 'application/json'
    },
  });
});

test.afterAll(async ({ }) => {
  await apiContext.dispose();
});

test.afterEach(async ({ page }, testInfo) => {
  console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);

  if (testInfo.status !== testInfo.expectedStatus)
    console.log(`Did not run as expected, ended up at ${page.url()}`);
});

test('Signup company on Intect', async ({playwright}) => {
  let secondaryVatNo = getRandom(8);

  const signupResponse = await apiContext.post(`/api/companies/signup`, {
    data: {
      "VatRegistrationNumber": "29831084",
      "SecondaryVatRegistrationNumber": `${secondaryVatNo}`,
      "CompanyName": "New Company",
      "ResponsibleUserUsername": "",
      "ResponsibleUserIdentityNumber": "",
      "ResponsibleUserFullName": "Sorin",
      "ResponsibleUserEmail": `svd+${secondaryVatNo}@intect.io`,
      "PhoneNumber": "",
      "LanguageId": 2,
      "KnowsIntectFrom": "",
      "NewUserPassword": "Sorintest9!",
      "SubscribeToNewsLetter": true,
      "AcceptStartupOffer": false,
      "PackageLevel": 2,
      "NewAccountName": "QA 123",
      "AccountTypeId": 0
    }
  });
  
  expect(signupResponse.ok()).toBeTruthy(); 

  // const signupData = await signupResponse.json();
  // console.log('New company ID: ', signupData.Id );

  // Logging in with the new company and getting the Intect token
  let loginApiContext = await playwright.request.newContext({
    baseURL: 'https://api.testintect.app/',
    extraHTTPHeaders: {
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      'Authorization': `Basic ${btoa(`svd+${secondaryVatNo}@intect.io:Sorintest9!`)}`
    },
  });

  const loginResponse = await loginApiContext.post('/api/auth/login');
  
  expect(loginResponse.ok()).toBeTruthy(); 
  
  const loginData = await loginResponse.json();
  let token = loginData.Token;
});