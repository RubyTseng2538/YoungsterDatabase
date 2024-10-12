const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const eventRoute = require('../API/eventRoute');
const { getDonorById } = require('../CRUD/donor');

const {
    getAllEvents,
    getEventsByName,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    addAttendees,
    removeAttendees,
    getEventsByDateRange,
    getEventsByDeadlineRange,
    getEventsByDonor,
    getActiveEvents
} = require('../CRUD/event');
const { get } = require('jquery');

jest.mock('../CRUD/event');
jest.mock('../CRUD/donor');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', eventRoute);

const isInt = jest.fn();

describe('Event Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/events should return all events', async () => {
        const mockEvents = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];
        getActiveEvents.mockResolvedValue(mockEvents);

        const response = await request(app).get('/api/events');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEvents);
        expect(getActiveEvents).toHaveBeenCalledTimes(1);
    });

    test('GET /api/events/:id should return a single event', async () => {
        const mockEvent = { id: 1, name: 'Event 1', eventDate: '2023-10-10T10:00:00Z', eventDeadline: '2023-10-09T10:00:00Z', fee: 100, eventStatus: 'ACTIVE' };
        getEvent.mockResolvedValue(mockEvent);

        const response = await request(app).get('/api/events/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEvent);
        expect(getEvent).toHaveBeenCalledWith(1);
    });

    test('GET /api/events/:id should return 404 if event not found', async () => {
        getEvent.mockResolvedValue(null);

        const response = await request(app).get('/api/events/999');

        expect(response.status).toBe(404);
        expect(getEvent).toHaveBeenCalledWith(999);
    });

    test('GET /api/events/:id should return 400 for invalid event ID', async () => {  
        const response = await request(app).get('/api/events/invalid-id');

        expect(response.status).toBe(400);
      });

    test('GET /api/events/ should return 500 if there is a server error', async () => {
        getActiveEvents.mockRejectedValue(new Error('Server error'));

        const response = await request(app).get('/api/events');

        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });

    test('POST /api/events should create a new event', async () => {
        const newEvent = { eventName: 'New Event', eventDate: '2023-10-10T10:00:00Z', eventDeadline: '2023-10-09T10:00:00Z', fee: '100', eventStatus: 'ACTIVE' };
        const createdEvent = { id: 1, ...newEvent };
        createEvent.mockResolvedValue(createdEvent);

        const response = await request(app)
            .post('/api/events')
            .send(newEvent);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(createdEvent);
        expect(createEvent).toHaveBeenCalledWith({
            eventName: 'New Event',
            eventDate: '2023-10-10T10:00:00Z',
            eventDeadline: '2023-10-09T10:00:00Z',
            eventStatus: 'ACTIVE',
            fee: 100
        });
    });

    test('POST /api/events should return 400 for invalid event data', async () => {
        const invalidData = { eventName: 'New Event', eventDate: '2023-10-10T10:00:00Z', eventDeadline: '2023-10-09T10:00:00Z', fee: 'invalid', eventStatus: 'ACTIVE' };
        const response = await request(app)
            .post('/api/events')
            .send(invalidData);
        
        expect(response.status).toBe(400);
    });

    test('PUT /api/events/:id should update an event', async () => {
        const updatedEvent = { eventName: 'Updated Event' };
        const mockUpdatedEvent = { id: 1, ...updatedEvent };
        updateEvent.mockResolvedValue(mockUpdatedEvent);

        const response = await request(app)
            .put('/api/events/1')
            .send(updatedEvent);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpdatedEvent);
        expect(updateEvent).toHaveBeenCalledWith(1, expect.objectContaining(updatedEvent));
    });

    test('PUT /api/events/:id should return 400 for invalid event data', async () => {
        const invalidData = {fee: 'invalid' };
        const response = await request(app)
            .put('/api/events/1')
            .send(invalidData);
        
        expect(response.status).toBe(400);
    });

    test('DELETE /api/events/:id should delete an event', async () => {
        const mockEvent = { id: 1, name: 'Event 1', eventDate: '2023-10-10T10:00:00Z', eventDeadline: '2023-10-09T10:00:00Z', fee: 100, eventStatus: 'ACTIVE' };
        getEvent.mockResolvedValue(mockEvent);
        deleteEvent.mockResolvedValue({ message: 'Event deleted' });

        const response = await request(app).delete('/api/events/1');

        expect(getEvent).toHaveBeenCalledWith(1);
        expect(response.status).toBe(204);
        expect(deleteEvent).toHaveBeenCalledWith(1);
    });

    test('PUT /api/events/addAttendees/:id should add an attendee', async () => {
        const mockAttendee = { userID: 1 };
        addAttendees.mockResolvedValue({ message: 'Attendee added' });
        getDonorById.mockResolvedValue(true);

        const response = await request(app)
            .put('/api/events/addAttendees/1')
            .send(mockAttendee);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Attendee added' });
        expect(addAttendees).toHaveBeenCalledWith(1, 1);
    });

    test('PUT /api/events/removeAttendees/:id should remove an attendee', async () => {
        const mockAttendee = { userID: 1 };
        removeAttendees.mockResolvedValue({ message: 'Attendee removed' });
        getDonorById.mockResolvedValue(true);

        const response = await request(app)
            .put('/api/events/removeAttendees/1')
            .send(mockAttendee);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Attendee removed' });
        expect(removeAttendees).toHaveBeenCalledWith(1, 1);
    });

    test('PUT /events/addAttendees/:id should return 400 for invalid user ID', async () => {
        const invalidData = { userID: 'invalid-id' }; // Invalid user ID
        getDonorById.mockResolvedValue(false);
        const response = await request(app)
            .put('/api/events/addAttendees/1')
            .send(invalidData);
        
        console.log(response.body);
        
        expect(response.status).toBe(400);
        expect(response.text).toBe('invalid entry');
    });

    // Test for user not found when removing attendees
    test('PUT /events/addAttendees/:id should return 400 if user not found', async () => {
        getDonorById.mockResolvedValue(null);

        const validData = { userID: '999' }; // Valid user ID but user not found

        const response = await request(app)
            .put('/api/events/addAttendees/1')
            .send(validData);

        expect(response.status).toBe(400);
        expect(response.text).toBe('invalid entry');
        expect(getDonorById).toHaveBeenCalledWith(999);
    });


    test('PUT /events/removeAttendees/:id should return 400 for invalid user ID', async () => {
        const invalidData = { userID: 'invalid-id' }; // Invalid user ID
        getDonorById.mockResolvedValue(false);
        const response = await request(app)
            .put('/api/events/removeAttendees/1')
            .send(invalidData);
        
        console.log(response.body);
        
        expect(response.status).toBe(400);
        expect(response.text).toBe('invalid entry');
    });

    // Test for user not found when removing attendees
    test('PUT /events/removeAttendees/:id should return 400 if user not found', async () => {
        getDonorById.mockResolvedValue(null);

        const validData = { userID: '999' }; // Valid user ID but user not found

        const response = await request(app)
            .put('/api/events/removeAttendees/1')
            .send(validData);

        expect(response.status).toBe(400);
        expect(response.text).toBe('invalid entry');
        expect(getDonorById).toHaveBeenCalledWith(999);
    });

    // Test for invalid event ID when deleting an event
    test('DELETE /events/:id should return 400 for invalid event ID', async () => {
        const response = await request(app).delete('/api/events/invalid-id');

        expect(response.status).toBe(400);
    });

    // // Test for event not found when deleting an event
    test('DELETE /events/:id should return 404 if event not found', async () => {
        getEvent.mockResolvedValue(null);

        const response = await request(app).delete('/api/events/999');

        expect(response.status).toBe(404);
        expect(getEvent).toHaveBeenCalledWith(999);
        
    });
});