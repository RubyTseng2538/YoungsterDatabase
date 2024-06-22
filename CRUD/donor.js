const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//create
async function createUser(email, name) {
    const donor = await prisma.donor.create({
      data: {
        email: email,
        name: name,
      },
    });
    return donor;
}

//read
async function getDonorById(id){
    const donor = await prisma.donor.findUnique({
        where:{
            id: id
           }
    });
    return donor
}


//combine email and name contain
async function getDonorByEmail(email){
    const donor = await prisma.donor.findUnique({
        where:{
            email: email
           }
    });
    return donor
}


//contain 
async function getDonorsByName(name){
    const donors = await prisma.donor.findMany({
        where:{
            name: name
        }
    });
    return donors
}

async function getDonorsByEvent(id){
    const donors = await prisma.donor.findMany({
        where:{
            events:{
                some:{
                    id: id
                },
            },
        },
    })
    return donors;
}

async function getAllDonors(){
    const donors = await prisma.donor.findMany();
    return donors;
}


//update
async function updateDonor(email, data){
    const donor = await prisma.donor.update({
        where:{
            email: email
        },
        data: data
    })
    return donor;
}

async function addEvents(id, eventID){
    const event = await prisma.donor.update({
        where: {
            id: id
        },
        data: {
            events: {connect: {id: eventID}}
        }
    })
}

async function removeEvents(eventID, userID){
    const donor = await prisma.donor.update({
        where: {
            id: userID
        },
        data: {
            events: {disconnect: {id: eventID}}
        }
    })
}

//delete
async function deleteDonor(email){
    const donor = await prisma.donor.delete({
        where:{
            email: email
        }
    })
}


module.exports={
    createUser,
    getAllDonors,
    getDonorByEmail,
    getDonorById,
    getDonorsByEvent,
    getDonorsByName,
    updateDonor,
    addEvents,
    removeEvents,
    deleteDonor
}