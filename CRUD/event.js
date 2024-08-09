const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//create
async function createEvent(data) {
    const event = await prisma.event.create({
      data: data
    });
    return event;
}


//read
async function getEvent(id){
    const event = await prisma.event.findUnique({
        where:{
            id: id
           }
    });
    return event
}

async function getEventsByName(name){
    const events = await prisma.event.findMany({
        where:{
            eventName: {contains: name, mode: 'insensitive'},
            
        }
    });
    return events
}

async function getEventsByNameCoordinator(name, coordinatorID){
    const events = await prisma.event.findMany({
        where:{
            AND:
            [{eventName: {contains: name, mode: 'insensitive'}},
            {eventCoordinators:{
                some:{
                    id: coordinatorID
                },
            }}]
        }
    });
    return events
}

async function getEventsByDonorCoordinator(id, coordinatorID){
    const events = await prisma.event.findMany({
        where:{
            AND: [{attendees:{
                some:{
                    id: id
                },
            }},
            {eventCoordinators:{
                some:{
                    id: coordinatorID
                },
            }}]
        },
    })
    return events;
}

async function getEventsByDonor(id){
    const events = await prisma.event.findMany({
        where:{
            attendees:{
                some:{
                    id: id
                },
            },
        },
    })
    return events;
}

async function getEventsByUser(id) {
    const events = await prisma.event.findMany({
        where: {
            eventCoordinators: {
                some: {
                    id: id
                },
            },
            eventStatus: true, // Add this line to filter only active events
        },
    });
    return events;
}

async function getEventsByDateRange(date1, date2){
    return await prisma.event.findMany({
        where: {
          eventDate: {
            lte: new Date(date2),
            gte: new Date(date1),
          },
        },
      });
}

async function getEventsByDeadlineRange(date1, date2){
    return await prisma.event.findMany({
        where: {
          eventDeadline: {
            lte: new Date(date2),
            gte: new Date(date1),
          },
        },
      });
}

async function getEventsByDateRangeCoordinator(date1, date2, coordinatorID){
    return await prisma.event.findMany({
        where: {
            AND: [{eventCoordinators:{
                some:{
                    id: coordinatorID
                },
            }},
          {eventDate: {
            lte: new Date(date2),
            gte: new Date(date1),
          }}],
        },
      });
}

async function getEventsByDeadlineRangeCoordinator(date1, date2){
    return await prisma.event.findMany({
        where: {
            AND: [{eventCoordinators:{
                some:{
                    id: coordinatorID
                },
            }},
          {eventDeadline: {
            lte: new Date(date2),
            gte: new Date(date1),
          }}]
        },
      });
}

async function getActiveEvents(pageNumber, take = 10) {  
    const events = await prisma.event.findMany({
        where: {
            eventStatus: true
        },
        skip: (pageNumber-1)*take,
        take: take,
    });
    return events;
}

async function getAllEvents(pageNumber, take = 10) {
    const events = await prisma.event.findMany({
        skip: (pageNumber - 1) * take,
        take: take,
    });
    return events;
}


//update
async function updateEvent(id, data){
    const event = await prisma.event.update({
        where:{
            id: id
        },
        data: data
    })
    return event;
}

async function addAttendees(id, userID){
    const event = await prisma.event.update({
        where: {
            id: id
        },
        data: {
            attendees: {connect: {id: userID}}
        }
    })
    return event
}

async function removeAttendees(eventID, userID){
    const event = await prisma.event.update({
        where: {
            id: eventID
        },
        data: {
            attendees: {disconnect: {id: userID}}
        }
    })
    return event
}

//delete
async function deleteEvent(id){
    const event = await prisma.event.delete({
        where:{
            id: id
        }
    })
}

module.exports={
    createEvent,
    getAllEvents,
    getEvent,
    getEventsByDateRange,
    getEventsByDeadlineRange,
    getEventsByNameCoordinator,
    getEventsByDonorCoordinator,
    getEventsByDateRangeCoordinator,
    getEventsByDeadlineRangeCoordinator,
    getEventsByDonor,
    getEventsByName,
    getEventsByUser,
    getActiveEvents,
    updateEvent,
    addAttendees,
    removeAttendees,
    deleteEvent
}
