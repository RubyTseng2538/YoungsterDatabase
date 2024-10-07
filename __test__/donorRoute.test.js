const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const donorRoute = require('../API/donorRoute');

const {
    getDonorByString,
    getDonorById,
    getAllDonors,
    deleteDonor,
    updateDonor,
    createDonor
} = require('../CRUD/donor');

jest.mock('../CRUD/donor');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', donorRoute);

describe('Donor Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/donors should return all donors', async () => {
        const donors = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
        getAllDonors.mockResolvedValue(donors);

        const response = await request(app).get('/api/donors');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(donors);
        expect(getAllDonors).toHaveBeenCalledTimes(1);
    });

    test('GET /api/donors with searchText should return filtered donors', async () => {
        const donors = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
        getDonorByString.mockResolvedValue(donors);

        const response = await request(app).get('/api/donors').query({ searchText: 'John' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(donors);
        expect(getDonorByString).toHaveBeenCalledWith('John');
    });

    test('GET /api/donors/:id should return a donor by id', async () => {
        const donor = { id: 1, name: 'John Doe', email: 'john@example.com' };
        getDonorById.mockResolvedValue(donor);

        const response = await request(app).get('/api/donors/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(donor);
        expect(getDonorById).toHaveBeenCalledWith(1);
    });

    test('GET /api/donors/:id should return 404 if donor not found', async () => {
        getDonorById.mockResolvedValue(null);
    
        const response = await request(app).get('/api/donors/999');
    
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Donor not found' });
        expect(getDonorById).toHaveBeenCalledWith(999);
    });
    
    // Test for invalid donor ID
    test('GET /api/donors/:id should return 400 for invalid donor ID', async () => {
        const response = await request(app).get('/api/donors/invalid-id');
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'invalid id' });
    });
    
    // Test for internal server error
    test('GET /api/donors should return 500 if there is a server error', async () => {
        getAllDonors.mockRejectedValue(new Error('Internal Server Error'));
    
        const response = await request(app).get('/api/donors');
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error' });
        expect(getAllDonors).toHaveBeenCalledTimes(1);
    });

    test('POST /api/donors should create a new donor', async () => {
        const newDonor = { id: 1, name: 'John Doe', email: 'john@example.com' };
        createDonor.mockResolvedValue(newDonor);

        const response = await request(app)
            .post('/api/donors')
            .send({ name: 'John Doe', email: 'john@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(newDonor);
        expect(createDonor).toHaveBeenCalledWith('john@example.com', 'John Doe');
    });

    test('PUT /api/donors/:id should update a donor', async () => {
        const updatedDonor = { id: 1, name: 'John Doe', email: 'john@example.com' };
        updateDonor.mockResolvedValue(updatedDonor);

        const response = await request(app)
            .put('/api/donors/1')
            .send({ name: 'John Doe', email: 'john@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedDonor);
        expect(updateDonor).toHaveBeenCalledWith(1, { name: 'John Doe', email: 'john@example.com' });
    });

    test('DELETE /api/donors/:id should delete a donor', async () => {
        deleteDonor.mockResolvedValue({ message: 'Donor deleted' });

        const response = await request(app).delete('/api/donors/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Donor deleted' });
        expect(deleteDonor).toHaveBeenCalledWith(1);
    });
});