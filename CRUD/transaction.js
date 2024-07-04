const { PrismaClient, PaymentMethod } = require("@prisma/client");

const { deleteReceipt } = require('./transactionReceipt');

const prisma = new PrismaClient();

//create
async function createTransaction(data, receiptData) {
    const receipt = await prisma.transactionReceipt.create({
        data: receiptData  
    })
    const transaction = await prisma.transaction.create({
      data: data,
    });

    return transaction, receipt;
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

async function getTransactionByDonor(id){
    const transactions = await prisma.transaction.findMany({
        where:{
            donorID: id
        },
    })
    return transactions;
}

async function getTransactionByEvent(id){
    const transactions = await prisma.transaction.findMany({
        where:{
            eventID: id
        },
    })
    return transactions;
}

async function getTransactionByEntryDate(date1, date2){
    return await prisma.transaction.findMany({
        where: {
          entryDate: {
            lte: new Date(date2),
            gte: new Date(date1),
          },
        },
      });
}

async function getTransactionByTransactionDate(date1, date2){
    return await prisma.transaction.findMany({
        where: {
          transactionDate: {
            lte: new Date(date2),
            gte: new Date(date1),
          },
        },
      });
}

async function getTransactionByPaymentMethod(paymentMethod){
    const transactions = await prisma.transaction.findMany({
        where:{
            paymentMethod: paymentMethod
        },
    })
    return transactions;
}

async function getAllDonationTransaction(){
    const transactions = await prisma.transaction.findMany({
        where:{
            donation: true
        },
    })
    return transactions;
}

async function getTransactionByNote(note){
    const transactions = await prisma.transaction.findMany({
        where:{
            note: {contains: note}
        },
    })
    return transactions;
}

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
            id: id,
        }
    })
    deleteReceipt(transaction.receiptID);

    return transaction;
}

module.exports ={
    createTransaction,
    getTransaction,
    getAllDonationTransaction,
    getAllTransactions,
    getTransactionByDonor,
    getTransactionByEvent,
    getTransactionByNote,
    getTransactionByPaymentMethod,
    getTransactionByEntryDate,
    getTransactionByTransactionDate,
    deleteTransaction
}