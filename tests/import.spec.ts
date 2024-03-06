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
                "MappingId": 9336,
                "Options": [
                    {
                        "Key": "save",
                        "Value": "noerror"
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
            data: {
                "AccountId":null,
                "FileBase64":`${fileDataBase64}`,
                "MappingId":9278,
                "Options":[{"Key":"save","Value":"noerror"},{"Key":"Change","Value":"Upsert"}]
            }
        })
        const importResJSON = await importResponse.json();
  
        expect(importResponse.ok()).toBeTruthy();
        expect(importResJSON['Errors']).toHaveLength(2)
        expect(importResJSON['Errors']).not.toBe(0)
        
        console.log('Errors: ', importResJSON['Errors']);
        console.log('Errors lentgh: ', importResJSON['Errors'].length);
    })
})