const request = require('supertest');
const express = require('express');
const transactionRouter = require('../API/transactionRoute');
const { getTransaction, getAllTransactions, getDynamicFilteredTransactions, createTransaction, editTransaction } = require('../CRUD/transaction');
const { getReceipt, getReceiptsByString, getAllReceipts } = require('../CRUD/transactionReceipt');
const { getDonorById } = require('../CRUD/donor');
const { PaymentMethod, TransactionType, Status } = require('@prisma/client');

jest.mock('../CRUD/transaction');
jest.mock('../CRUD/transactionReceipt');
jest.mock('../CRUD/donor');

const app = express();
app.use(express.json());
app.use('/api', transactionRouter);

describe('Transaction Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/transaction', () => {
        // it('should return all transactions when no filters are applied', async () => {
        //     getAllTransactions.mockResolvedValue([{ id: 1, amount: 100 }]);

        //     const res = await request(app).get('/api/transaction');

        //     expect(res.status).toBe(200);
        //     expect(res.body).toEqual([{ id: 1, amount: 100 }]);
        //     expect(getAllTransactions).toHaveBeenCalledTimes(1);
        // });

        it('should return filtered transactions when filters are applied', async () => {
            getDynamicFilteredTransactions.mockResolvedValue([{ id: 2, amount: 200 }]);

            const res = await request(app).get('/api/transaction').query({ EntryDateOne: '01/01/2022', EntryDateTwo: '01/31/2022' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ id: 2, amount: 200 }]);
            expect(getDynamicFilteredTransactions).toHaveBeenCalledTimes(1);
        });
    });

    describe('GET /api/transaction/:id', () => {
        it('should return a transaction by id', async () => {
            getTransaction.mockResolvedValue({ id: 1, amount: 100 });

            const res = await request(app).get('/api/transaction/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ id: 1, amount: 100 });
            expect(getTransaction).toHaveBeenCalledWith(1);
        });

        it('should return 400 for invalid id', async () => {
            const res = await request(app).get('/api/transaction/abc');

            expect(res.status).toBe(400);
            expect(res.text).toBe('invalid id');
        });
    });

    // describe('POST /api/transaction', () => {
    //     it('should create a new transaction', async () => {
    //         const newTransaction = {
    //             entryDate: '2022-01-01T00:00:00Z',
    //             transactionDate: '2022-01-01T00:00:00Z',
    //             donorID: 1,
    //             eventID: 1,
    //             paymentMethod: 'CASH',
    //             amount: 100,
    //             receiptNumber: '12345',
    //             referenceNumber: 'ref123',
    //             transactionType: 'DEPOSIT',
    //             status: 'PENDING',
    //             email: 'test@example.com',
    //             name: 'Test User',
    //             sendDate: '2022-01-01T00:00:00Z'
    //         };

    //         createTransaction.mockResolvedValue(newTransaction);

    //         const res = await request(app).post('/api/transaction').send(newTransaction);

    //         expect(res.status).toBe(200);
    //         expect(res.body).toEqual(newTransaction);
    //         expect(createTransaction).toHaveBeenCalledTimes(1);
    //     });

    //     it('should return 400 for invalid data', async () => {
    //         const invalidTransaction = {
    //             entryDate: 'invalid-date',
    //             donorID: 'not-a-number'
    //         };

    //         const res = await request(app).post('/api/transaction').send(invalidTransaction);

    //         expect(res.status).toBe(400);
    //         expect(res.text).toBe('invalid entry');
    //     });
    // });

    describe('DELETE /api/transaction/:id', () => {
        it('should mark a transaction as VOID', async () => {
            editTransaction.mockResolvedValue({ id: 1, status: 'VOID' });

            const res = await request(app).delete('/api/transaction/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ id: 1, status: 'VOID' });
            expect(editTransaction).toHaveBeenCalledWith(1, { status: Status.VOID });
        });

        it('should return 400 for invalid id', async () => {
            const res = await request(app).delete('/api/transaction/abc');

            expect(res.status).toBe(400);
            expect(res.text).toBe('invalid id');
        });
    });

    describe('GET /api/transactionReceipt', () => {
        it('should return all receipts when no search text is provided', async () => {
            getAllReceipts.mockResolvedValue([{ receiptNumber: '12345' }]);

            const res = await request(app).get('/api/transactionReceipt');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ receiptNumber: '12345' }]);
            expect(getAllReceipts).toHaveBeenCalledTimes(1);
        });

        it('should return receipts matching search text', async () => {
            getReceiptsByString.mockResolvedValue([{ receiptNumber: '12345' }]);

            const res = await request(app).get('/api/transactionReceipt').query({ searchText: '12345' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ receiptNumber: '12345' }]);
            expect(getReceiptsByString).toHaveBeenCalledTimes(1);
        });
    });

    describe('GET /api/transactionReceipt/:id', () => {
        it('should return a receipt by id', async () => {
            getReceipt.mockResolvedValue({ receiptNumber: '12345' });

            const res = await request(app).get('/api/transactionReceipt/12345');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ receiptNumber: '12345' });
            expect(getReceipt).toHaveBeenCalledWith('12345');
        });

        it('should return 400 for invalid receipt id', async () => {
            getReceipt.mockResolvedValue(null);

            const res = await request(app).get('/api/transactionReceipt/invalid');

            expect(res.status).toBe(400);
            expect(res.text).toBe('invalid receipt id');
        });
    });
});