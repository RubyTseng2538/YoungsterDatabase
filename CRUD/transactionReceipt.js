const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const { incrementConfig, getConfigStringByUser, getConfigByUser } = require("./receiptConfig");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//create
async function createReceipt(data) {
    const receipt = await prisma.transactionReceipt.create({
      data: data
    });
    return receipt;
}


//read'

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

//update transaction to allow changes to send receipt
async function createOrUpdateReceipt(transactionID, data, userID ,tx=prisma){
    return tx.$transaction(async (tx) => {
        const transaction = await tx.transaction.findUnique({
            where:{
                id: transactionID
            }
        })
        if(transaction.status == "COMPLETED"){
            if(transaction.receiptID){
                const receipt = await tx.transactionReceipt.update({
                    where:{
                        receiptNumber: transaction.receiptID
                    },
                    data:{
                        email: data.email,
                        name: data.name,
                        sendDate: new Date()
                    }
                })
                const msg = {
                    to: data.email, // Change to your recipient
                    from: 'rubytseng.usa@gmail.com', // Change to your verified sender
                    dynamic_template_data: {
    
                        "receiptNo":transaction.receiptID,
            
                        "amount":transaction.amount,
            
                        "paymentMethod":transaction.paymentMethod,
            
                        "notes":transaction.note,
        
            
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
            }else{
                const string = await getConfigStringByUser(userID);
        
            // 2. Verify that the sender's balance didn't go below zero.
                if (string.length <= 0) {
                throw new Error(`User does not have sufficient permissions to create a transaction.`);
                }
                const receipt = await tx.transactionReceipt.create({
                    data:{
                        email: data.email,
                        name: data.name,
                        sendDate: new Date(),
                        transaction: { connect: { id: transaction.id } },
                        receiptNumber: string
                    }
                })
                const config = await getConfigByUser(userID);
                await incrementConfig(config[0].prefix, tx);
                const msg = {
                    to: data.email, // Change to your recipient
                    from: 'rubytseng.usa@gmail.com', // Change to your verified sender
                    dynamic_template_data: {
    
                        "receiptNo":string,
            
                        "amount":transaction.amount,
            
                        "paymentMethod":transaction.paymentMethod,
            
                        "notes":transaction.note,
        
            
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
            
        
    }else{
        throw new Error('Transaction is not completed');
    }
})
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
    deleteReceipt,
    createOrUpdateReceipt
}

//
//  {
//     donor:'Eugene',
//     amount:100,
//  }
 // update or create
//  api/create/receipt/:transId
//  {
//     name:'eguene'
//     email:'sdsads'
//  }
//  only completed trransction can generated receipt
//  1000 get receipt by transId
//  yes -> update receipt info -> send receipt 
//  no -> create new receipt  ->  send receip
