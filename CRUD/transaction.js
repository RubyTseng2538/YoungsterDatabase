const { PrismaClient, PaymentMethod, Status } = require("@prisma/client");

const { deleteReceipt } = require('./transactionReceipt');
const { incrementConfig, getConfigStringByUser, getConfigByUser } = require("./receiptConfig");
const { get } = require("jquery");
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

        const transaction = await tx.transaction.create({
            data:{
                entryDate: new Date(),
                transactionDate: transactionData.transactionDate,
                donor: { connect: { id: donor } },
                createdBy: { connect: { GoogleId: userID } },
                event: { connect: { id: event } },
                paymentMethod: transactionData.paymentMethod,
                amount: transactionData.amount,
                referenceNumber: transactionData.referenceNumber,
                transactionType: transactionData.transactionType,
                status: transactionData.status,
                note: transactionData.note,
                donation: transactionData.donation,
            }
        })

        if(receiptData&&receiptData.email){
        // default receipt email to donor's email
            const transactionReceipt = await tx.transactionReceipt.create({
                data:{
                    email: receiptData.email,
                    name: receiptData.name,
                    sendDate: new Date(),
                    transaction: { connect: { id: transaction.id } },
                    receiptNumber: string
                }
            })
        
            // 3. Increment the receipt number.
            const config = await getConfigByUser(userID);
            await incrementConfig(config[0].prefix, tx);
            // status === completed
            if(transactionData.status === 'COMPLETED' &&  config[0].autosend){
                // send email
                const msg = {
                    to: receiptData.email, // Change to your recipient
                    from: 'rubytseng.usa@gmail.com', // Change to your verified sender
                    dynamic_template_data: {

                        "receiptNo":string,
            
                        "amount":transactionData.amount,
            
                        "paymentMethod":transactionData.paymentMethod,
            
                        "notes":transactionData.note,
        
            
                    },
                    template_id: process.env.TEMPLATE_ID
                }
                sgMail
                    .send(msg)
                    .then(() => {
                    console.log('Email sent')
                    })
                    .catch((error) => {
                    console.error(error)
                    })
        }
    }

    return { transaction };
    });
    // if autosend is true, send receipt email (use sendgrid)
    // email status 
}

async function manualSendReceipt(transactionID){
    return prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.findUnique({
            where:{
                id: transactionID
            }
        })
        if(transaction.status == Status.COMPLETED){
            const receipt = await tx.transactionReceipt.update({
                where:{
                    receiptNumber: transaction.receiptID
                },
                data:{
                    sendDate: new Date()
                }
            })
            // send email
            const msg = {
                to: receipt.email, // Change to your recipient
                from: 'rubytseng.usa@gmail.com',
                dynamic_template_data: {
                    "receiptNo":transaction.receiptID,
                    "amount":transaction.amount,
                    "paymentMethod":transaction.paymentMethod,
                    "notes":transaction.note,
                },
                template_id: "d-508dcb4116b04d519e48b1484e21efc8"
            
            }
            sgMail.send(msg).then(() => {console.log('Email sent')}).catch((error) => {console.error(error)})

            await tx.transaction.update({
                where:{
                    id: transactionID
                },
                data:{
                    configPrefix: null
                }
            })
        }
        return transaction;
    })
    
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
//can only update transaction status
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
    getAllTransactions,
    getDynamicFilteredTransactions, 
    manualSendReceipt,
    editTransaction,
    deleteTransaction
}


