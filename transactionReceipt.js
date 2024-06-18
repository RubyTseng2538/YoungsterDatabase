const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//create
async function createReceipt(data) {
    const receipt = await prisma.transactionReceipt.create({
      data: data
    });
    return receipt;
}


//read
async function getReceipt(receiptNumber){
    const receipt = await prisma.transactionReceipt.findUnique({
        where:{
            receiptNumber: receiptNumber
           }
    });
    return receipt
}

async function getReceiptsByEmail(email){
    const receipts = await prisma.transactionReceipt.findMany({
        where:{
            email: email
        }
    });
    return receipts
}

async function getAllReceipts(){
    const receipts = await prisma.transactionReceipt.findMany();
    return receipts;
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
async function deleteReceipt(receiptNumber){
    const receipt = await prisma.transactionReceipt.delete({
        where:{
            receiptNumber: receiptNumber
        }
    })
}