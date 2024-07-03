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

async function getEventsByDateRange(date1, date2){
    return await prisma.event.findMany({
        where: {
          eventDate: {
            lte: new Date(date2),
            get: new Date(date1),
          },
        },
      });
}

async function getEventsByDeadlineRange(date1, date2){
    return await prisma.event.findMany({
        where: {
          eventDeadline: {
            lte: new Date(date2),
            get: new Date(date1),
          },
        },
      });
}

async function getAllEvents(){
    const events = await prisma.event.findMany();
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
    getEventsByDonor,
    getEventsByName,
    updateEvent,
    addAttendees,
    removeAttendees,
    deleteEvent
}
