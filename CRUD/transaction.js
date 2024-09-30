const { PrismaClient, PaymentMethod } = require("@prisma/client");

const { deleteReceipt } = require('./transactionReceipt');
const { incrementConfig, getConfigStringByUser, getConfigByUser } = require("./receiptConfig");
const { get } = require("jquery");

const prisma = new PrismaClient();



//create
async function createTransaction(userID, transactionData, donor, event, receiptData) {

    return prisma.$transaction(async (tx) => {
        // 1. Decrement amount from the sender.
        const string = await getConfigStringByUser(userID);
    
        // 2. Verify that the sender's balance didn't go below zero.
        if (string.length <= 0) {
          throw new Error(`User does not have sufficient permissions to create a transaction.`);
        }

        receiptData.receiptNumber = string;
        const transaction = await tx.transaction.create({
            data:{
                entryDate: transactionData.entryDate,
                transactionDate: transactionData.transactionDate,
                donor: { connect: { id: donor } },
                createdBy: { connect: { GoogleId: userID } },
                event: { connect: { id: event } },
                paymentMethod: transactionData.paymentMethod,
                amount: transactionData.amount,
                referenceNumber: transactionData.referenceNumber,
                transactionType: transactionData.transactionType,
                status: transactionData.status,
                email: transactionData.email,
                name: transactionData.name,
                sendDate: transactionData.sendDate,
                note: transactionData.note,
                donation: transactionData.donation,
            }
        })

        const transactionReceipt = await tx.transactionReceipt.create({
            data:{
                email: receiptData.email,
                name: receiptData.name,
                sendDate: receiptData.sendDate,
                transaction: { connect: { id: transaction.id } },
                receiptNumber: string
            }
        })
    
        // 3. Increment the receipt number.
        const config = await getConfigByUser(userID);
        await incrementConfig(config[0].prefix, tx);

    return { transaction, transactionReceipt }
    });
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

async function getDynamicFilteredTransactions(filters, pageNumber = 1, take = 10) {
    const transactions = await prisma.transaction.findMany({
        where: filters,
        skip: (pageNumber-1)*take,
        take: take,
        orderBy: {
            entryDate: 'desc',
        },
    });
    return transactions;
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

async function getAllTransactions(pageNumber = 1, take = 10) {
    const transactions = await prisma.transaction.findMany({
        skip: (pageNumber - 1) * take,
        take: take,
        orderBy: {
            entryDate: 'desc',
        },
    });
    return transactions;
}


//update
async function editTransaction(id, data){
    const event = await prisma.event.update({
        where:{
            id: id
        },
        data: data
    })
    return event;
}

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
    getDynamicFilteredTransactions, 
    editTransaction,
    deleteTransaction
}