//https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/

const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();
const {getDonorByString, getDonorById, getAllDonors, deleteDonor, updateDonor, createDonor} = require('../CRUD/donor');
const { isAuthenticated } = require('./APIAuthentication');
const {checkPermissionLevel } = require('./APIAuthorization');
 
let urlencodedParser = bodyParser.urlencoded({ extended: false })

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
 router.get('/donors', isAuthenticated, checkPermissionLevel(2), async (req,res)=>{
    const {searchText} = req.query;
    console.log(req.query);
    if(!searchText){
      res.send(await getAllDonors());
    }else{
      res.send(await getDonorByString(searchText));
    }
    
 })

 //get filter id
 router.get('/donors/:id', isAuthenticated, checkPermissionLevel(2), donorMiddleware,async(req,res)=>{
    const id = req.params.id;
    res.json(await getDonorById(id))
 })

 //create donor
 router.post("/donors", isAuthenticated, checkPermissionLevel(2), urlencodedParser, async(req, res)=>{
  const data = req.body;
   let email= data.email;
   let name= data.name;
   if(!name || !email || !validateEmail(email)){
    res.status(400).send('invalid entry')
   }else{
    res.json(await createDonor(email, name))
   }
 })

 //update donor
 router.put('/donors/:id', isAuthenticated, checkPermissionLevel(2), donorMiddleware, urlencodedParser, async(req, res)=>{
   const id = req.params.id;
   let data = req.body;
   let entry = {};
   if(data.email&&validateEmail(data.email)){
    entry = {
      email: data.email,
      name: data.name
    }
    res.json(await updateDonor(id, entry));
   }else if(!data.email && data.name){
    entry = {
      name: data.name
    }
    res.json(await updateDonor(id, entry));
   }else{
    res.status(400).send('invalid entry');
   }
   console.log(entry);
 })

 //delete donor
 router.delete('/donors/:id', isAuthenticated, checkPermissionLevel(2),donorMiddleware, async(req, res)=>{
   const id = req.params.id;
   res.json(await deleteDonor(id))
 })


 module.exports=router;