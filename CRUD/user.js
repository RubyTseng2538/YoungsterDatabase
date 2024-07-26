const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//create
async function createUser(id, email, name, roles) {
    const user = await prisma.user.create({
      data: {
        id: id,
        email: email,
        name: name,
        roles: roles
      },
    });
    return user;
}

//read
async function getUserById(id){
    const user = await prisma.user.findUnique({
        where:{
            GoogleId: id
           }
    });
    return user
}

async function getUserByEmail(email){
    const user = await prisma.user.findUnique({
        where:{
            email: email
        }
    });
    return user;
}


//combine email and name contain
async function getUserByString(string){
    const users = await prisma.user.findMany({
        where:
            {OR: [{
                email: {
                    contains: string,
                    mode: 'insensitive'
                }
            },{
                name: {
                    contains: string,
                    mode: 'insensitive'
                }
            }
        ]}
    });
    return users
}

async function getAllUsers(){
    const users = await prisma.user.findMany();
    return users;
}

async function getUserPermissions(id){
    const user = await prisma.user.findUnique({
        where:{
            GoogleId: id
        }
    })
    return user;

}


//update
async function updateUser(id, data){
    const user = await prisma.user.update({
        where:{
            id: id
        },
        data: data
    });
    return user;
}

async function addEvents(id, eventID){
    const event = await prisma.user.update({
        where: {
            id: id
        },
        data: {
            events: {connect: {id: eventID}}
        }
    })
}

async function removeEvents(eventID, userID){
    const user = await prisma.user.update({
        where: {
            id: userID
        },
        data: {
            events: {disconnect: {id: eventID}}
        }
    })
}

//delete
async function deleteUser(id){
    const user = await prisma.user.delete({
        where:{
            id: id
        }
    })
}


module.exports={
    createUser,
    getAllUsers,
    getUserByString,
    getUserById,
    getUserByEmail,
    getUserPermissions,
    updateUser,
    addEvents,
    removeEvents,
    deleteUser
}