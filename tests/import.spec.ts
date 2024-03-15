import { test, expect } from '@playwright/test';
const fs = require('fs')

let token;
let importMappingId;

test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/auth/login');
    
    expect(response.ok()).toBeTruthy(); 
    const data = await response.json();
    token = data.Token;
    expect(data.Token).toBeTruthy();

    const getMappingIds = await request.get('api/importmapping', {
        headers: {
        'Accept': 'application/json; charset=utf-8',
        'Authorization': `Token ${token}`,
        }})

    const mappingIdsData = await getMappingIds.json();
    importMappingId = mappingIdsData[1].Id;
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
                "MappingId": `${importMappingId}`, // This value changes on deployment of a new Intect app version.
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

        console.log('Errors: ', importResJSON['Errors']);
        console.log('Errors lentgh: ', importResJSON['Errors'].length);

        expect(importResJSON['Errors'].length).toBe(0)
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
                "MappingId": `${importMappingId}`,
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

        console.log('Errors: ', importResJSON['Errors']);
        console.log('Errors lentgh: ', importResJSON['Errors'].length);
        
        expect(importResJSON['Errors'].length).not.toBe(0)
    })
})