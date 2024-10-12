//https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/

const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();
const {getDonorByString, getDonorById, getAllDonors, deleteDonor, updateDonor, createDonor} = require('../CRUD/donor');
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
router.get('/donors', async (req, res) => {
  try {
      const { searchText } = req.query;
      console.log(req.query);
      if (!searchText) {
          res.send(await getAllDonors());
      } else {
          res.send(await getDonorByString(searchText));
      }
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

 //get filter id
 router.get('/donors/:id', donorMiddleware, async (req, res) => {
  try {
      const id = req.params.id;
      const donor = await getDonorById(id);
      if(donor==null){
            res.status(404).send('Donor not found');
      }else{
        res.json(donor);
      }
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

 //create donor
 router.post('/donors', urlencodedParser, async (req, res) => {
  try {
      const { name, email } = req.body;
      if (!name || !email || !validateEmail(email)) {
          res.status(400).send('Invalid entry');
      } else {
          res.json(await createDonor(email, name));
      }
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

 //update donor
 router.put('/donors/:id', donorMiddleware, urlencodedParser, async (req, res) => {
  try {
      const id = req.params.id;
      const { name, email } = req.body;
      if (!name || !email || !validateEmail(email)) {
          res.status(400).send('Invalid entry');
      } else {
          res.json(await updateDonor(id, email, name));
      }
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

 //delete donor
 router.delete('/donors/:id', donorMiddleware, async (req, res) => {
  try {
      const id = req.params.id;
      const donor = await getDonorById(id);
      if(donor==null){
        res.status(404).send('Donor not found');
      }else{
        await deleteDonor(id);
        res.status(204).send();
      }
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});


 module.exports=router;