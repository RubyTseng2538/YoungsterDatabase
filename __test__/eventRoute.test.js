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

jest.mock('../CRUD/event');
jest.mock('../CRUD/donor');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', eventRoute);

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

    // test('GET /api/events/:id should return a single event', async () => {
    //     const mockEvent = { id: 1, name: 'Event 1' };
    //     getEvent.mockResolvedValue(mockEvent);

    //     const response = await request(app).get('/api/events/1');

    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual(mockEvent);
    //     expect(getEvent).toHaveBeenCalledWith(1);
    // });

    test('POST /api/events should create a new event', async () => {
        const newEvent = { eventName: 'New Event', eventDate: '2023-10-10T10:00:00Z', eventDeadline: '2023-10-09T10:00:00Z', fee: '100' };
        const createdEvent = { id: 1, ...newEvent };
        createEvent.mockResolvedValue(createdEvent);

        const response = await request(app)
            .post('/api/events')
            .send(newEvent);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(createdEvent);
        expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
            eventName: 'New Event',
            eventDate: '2023-10-10T10:00:00Z',
            eventDeadline: '2023-10-09T10:00:00Z',
            fee: 100
        }));
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

    test('DELETE /api/events/:id should delete an event', async () => {
        deleteEvent.mockResolvedValue({ message: 'Event deleted' });

        const response = await request(app).delete('/api/events/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Event deleted' });
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
});