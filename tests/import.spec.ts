import { test, expect } from '@playwright/test';
const fs = require('fs')

let token;

test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/auth/login');
        expect(response.ok()).toBeTruthy(); 
        const data = await response.json();
        token = data.Token;
        expect(data.Token).toBeTruthy();
})
  
test.describe("Intect import module",()=>{
    test('Import Excel file via API without errors', async ({request}) => {   
        const fileDataBase64 = fs.readFileSync('./test-files/Create_Employee_Import_Without_Errors.xlsx', 'base64')
  
        const importResponse = await request.post('/api/import', {
            headers: {
            'Accept': 'application/json; charset=utf-8',
            'Authorization': `Token ${token}`,
            },
            data: {
                "AccountId": null,
                "FileBase64": `${fileDataBase64}`,
                "MappingId": 9684, // This value changes on deployment of a new Intect app version.
                "Options": [
                    {
                        "Key": "save",
                        "Value": "always"
                    },
                    {
                        "Key": "Change",
                        "Value": "Upsert"
                    }
                ]
            }
        })

        console.log(importResponse);
        
        expect(importResponse.ok()).toBeTruthy();
        const importResJSON = await importResponse.json();
        expect(importResJSON['Errors'].length).toBe(0)

        console.log('Errors: ', importResJSON['Errors']);
        console.log('Errors lentgh: ', importResJSON['Errors'].length);
    })

    test('Import Excel file via API with errors', async ({request}) => {   
        const fileDataBase64 = fs.readFileSync('./test-files/Create_Employee_Import_With_Errors.xlsx', 'base64')
  
        const importResponse = await request.post('/api/import', {
            headers: {
            'Accept': 'application/json; charset=utf-8',
            'Authorization': `Token ${token}`,
            },
            data: 
            {
                "AccountId": null,
                "FileBase64": `${fileDataBase64}`,
                "MappingId": 9684,
                "Options": [
                    {
                        "Key": "save",
                        "Value": "always"
                    },
                    {
                        "Key": "Change",
                        "Value": "Upsert"
                    }
                ]
            }
        })
        const importResJSON = await importResponse.json();
  
        expect(importResponse.ok()).toBeTruthy();
        expect(importResJSON['Errors'.length]).not.toBe(0)
        
        console.log('Errors: ', importResJSON['Errors']);
        console.log('Errors lentgh: ', importResJSON['Errors'].length);
    })
})