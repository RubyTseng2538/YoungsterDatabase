const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getDonors = async () => {
       return prisma.donor.findMany({where:{
        email: "skocher2m@nydailynews.com"
       }});
}

//create

//read

//update

//delete

getDonors().then((donors)=>{
    console.log(donors)
})