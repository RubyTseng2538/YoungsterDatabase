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

async function getReceiptsByString(string){
    const receipts = await prisma.transactionReceipt.findMany({
        where:
            {OR: [{
                email: {
                    contains: string
                }
            },{
                name: {
                    contains: string
                }
            }
        ]}
    });
    return receipts
}

async function getAllReceipts(){
    const receipts = await prisma.transactionReceipt.findMany();
    return receipts;
}

//delete
async function deleteReceipt(receiptNumber){
    const receipt = await prisma.transactionReceipt.delete({
        where:{
            receiptNumber: receiptNumber
        }
    })
}

module.exports={
    createReceipt,
    getReceipt,
    getReceiptsByString,
    getAllReceipts,
    deleteReceipt
}