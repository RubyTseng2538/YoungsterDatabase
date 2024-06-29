//https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/

const {Router} = require('express');
const router = new Router();
const {getDonorByString, getDonorById, getAllDonors, deleteDonor, updateDonor, createUser} = require('../CRUD/donor');
function isInt(value) {
    var x = parseFloat(value);
    return !isNaN(value) && (x | 0) === x;
  }

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

const donorMiddleware = (req,res,next) => {
    const id = req.params.id;
    if(!id || isNaN(id) || !isInt(id)){
       return  res.status(400).send("invalid id")
    }
    req.params.id = parseInt(id)
    next()
}

//get list of donor & get filter name | email
 router.get('/donors',async (req,res)=>{
    const {searchText} = req.query;
    console.log(req.query);
    if(!searchText){
      res.send(await getAllDonors());
    }else{
      res.send(await getDonorByString(searchText));
    }
    
 })

 //get filter id
 router.get('/donors/:id',donorMiddleware,async(req,res)=>{
    const id = req.params.id;
    res.json(await getDonorById(id))
 })

 //create donor
 router.post("/donors", async(req, res)=>{
   let email= req.query.email;
   let name= req.query.name;
   if(!name || !email || !validateEmail(email)){
    res.send(400, "invalid entry");
   }else{
    res.json(await createUser(email, name))
   }
 })

 //update donor
 router.put('/donors/:id', donorMiddleware, async(req, res)=>{
   const id = req.params.id;
   let data = {
      email: req.query.email,
      name: req.query.name
   }
   console.log(data);
   res.json(await updateDonor(id, data))
 })

 //delete donor
 router.delete('/donors/:id', donorMiddleware, async(req, res)=>{
   const id = req.params.id;
   res.json(await deleteDonor(id))
 })


 module.exports=router;