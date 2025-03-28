const request = require('supertest');
const app = require('../../app');

describe('Test GET /launches', () => { // Test fixture
    test('It should respond with 200 success', async () => { // Test case
        await request(app)
            .get('/launches')
            .expect('Content-Type', /json/)
            .expect(200)

        // expect(response.statusCode).toBe(200) // assertion
    })
})

describe('Test POST /launches', () => {
    test('It should respond with 200 success', () => {

    })

    test('It should catch missing required properties', () => {

    })

    test('It should catch invalid dates', () => {

    })
})