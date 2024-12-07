const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const convertNumberToString = (prefix, number) => {
    const digit = number.toString().length;
    const leadingZeroes = 8- digit;
    return prefix + "-"+"0".repeat(leadingZeroes) + number.toString();
}


//create config
async function createConfig(prefix, name) {
    const config = await prisma.receiptConfig.create({
        data: {
            prefix: prefix,
            name: name
        },
    });
    return config;
}

//increment config
async function incrementConfig(prefix, tx=prisma) {
    const config = await tx.receiptConfig.update({
        where: {
            prefix: prefix
        },
        data: {
            nextNumber: {
                increment: 1
            }
        }
    });
    return config;
}

async function assignConfig(prefix, userID){
    const config = await prisma.receiptConfig.update({
        where: {
            prefix: prefix
        },
        data: {
            user: {
                connect: {
                    id: userID
                }
            }
        }
    });
    return config;
}

//get config
async function getConfigByPrefix(prefix) {
    const config = await prisma.receiptConfig.findUnique({
        where: {
            prefix: prefix
        }
    });
    const string = convertNumberToString(config[0].prefix, config[0].nextNumber);
    return string;
} 

async function getConfigStringByUser(userID){
    const config = await prisma.receiptConfig.findMany({
        where: {
            user: {
                some:{GoogleId: userID}
            }
        }
    });
    const string = convertNumberToString(config[0].prefix, config[0].nextNumber);
    return string;
}

async function getConfigByUser(userID){
    const config = await prisma.receiptConfig.findMany({
        where: {
            user: {
                some:{GoogleId: userID}
            }
        }
    });
    return config;
}

async function getTransactionIDByConfig(config){
    const transaction = await prisma.transactionReceipt.findMany({
        where:{
            configPrefix: config
        }
    });
    return transaction;
}

async function turnOnAndOffConfig(userID, status){
    return prisma.$transaction(async (tx) => {
    const prefix = await tx.receiptConfig.findMany({
        where: {
            user: {
                some:{GoogleId: userID}
            }
        }});
    if(prefix){
        console.log(prefix[0].prefix); 
        const config = await tx.receiptConfig.update({
            where: {
                prefix: prefix[0].prefix
            },
            data: {
                autosend: status
            }
        });
        return config;
    }else{
        return null;
    }
    });
}

module.exports = {
    createConfig,
    incrementConfig,
    assignConfig,
    getConfigByPrefix,
    getConfigByUser,
    getConfigStringByUser,
    getTransactionIDByConfig,
    turnOnAndOffConfig
};