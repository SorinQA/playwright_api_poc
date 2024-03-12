import { test, expect } from '@playwright/test';

let token;

test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/auth/login');
        expect(response.ok()).toBeTruthy(); 
        const data = await response.json();
        token = data.Token;
        expect(data.Token).toBeTruthy();
})
  
test.describe("Intect login module",()=>{
    test('Get employment templates', async ({request}) => {   
        const response = await request.get('/api/employmenttemplates/simple', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Token ${token}`
            }
        });
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data[1].Name).toEqual('Fastansat');
        // Passing assertion:
        expect(data).toContainEqual(expect.objectContaining({"Id": 39708, "Name": "Fastansat"}));
    })
})