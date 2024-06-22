//https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/

const {Router} = require('express');
const router = new Router();
const {getAllDonors, getDonorById} = require('../CRUD/donor');
function isInt(value) {
    var x = parseFloat(value);
    return !isNaN(value) && (x | 0) === x;
  }

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
    console.log(searchText);
    res.send(await getAllDonors());
 })

 //get filter id
 router.get('/donors/:id',donorMiddleware,async(req,res)=>{
    const id = req.params.id;
    res.json(await getDonorById(id))
 })

 //create donor

 //update donor

 //delete donor



 module.exports=router;