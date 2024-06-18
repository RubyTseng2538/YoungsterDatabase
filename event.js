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
            eventName: name
        }
    });
    return events
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

//delete
async function deleteEvent(id){
    const event = await prisma.event.delete({
        where:{
            id: id
        }
    })
}