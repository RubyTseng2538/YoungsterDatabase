const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//create
async function createTransaction(data) {
    const transaction = await prisma.transaction.create({
      data: data
    });
    return transaction;
}


//read
async function getTransaction(id){
    const transaction = await prisma.transaction.findUnique({
        where:{
            id: id
           }
    });
    return transaction
}

// async function getEventsByName(name){
//     const events = await prisma.event.findMany({
//         where:{
//             eventName: name
//         }
//     });
//     return events
// }

async function getAllTransactions(){
    const transactions = await prisma.transaction.findMany();
    return transactions;
}


//update
// async function updateEvent(id, data){
//     const event = await prisma.event.update({
//         where:{
//             id: id
//         },
//         data: data
//     })
//     return event;
// }

//delete
async function deleteTransaction(id){
    const transaction = await prisma.transaction.delete({
        where:{
            id: id
        }
    })
}