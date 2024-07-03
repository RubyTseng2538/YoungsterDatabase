const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();

const { getAllEvents, getEventsByName, getEvent, createEvent, updateEvent, deleteEvent } = require('../CRUD/event');

let urlencodedParser = bodyParser.urlencoded({ extended: false });

function isInt(value) {
    var x = parseFloat(value);
    return !isNaN(value) && (x | 0) === x;
  }

const validateDate = (Date) => {
    return String(Date).match(
        /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/
      );
  };


const eventMiddleware = (req,res,next) => {
    const id = req.params.id;
    if(!id || isNaN(id) || !isInt(id)){
       return  res.status(400).send("invalid id")
    }
    req.params.id = parseInt(id)
    next()
}

//get list of donor & get filter name | email
router.get('/events',async (req,res)=>{
    const {searchText} = req.query;
    console.log(req.query);
    if(!searchText){
      res.send(await getAllEvents());
    }else{
      res.send(await getEventsByName(searchText));
    }
    
 })

 //get filter id
 router.get('/events/:id',eventMiddleware,async(req,res)=>{
    const id = req.params.id;
    res.json(await getEvent(id))
 })

 //create event
 router.post("/events", urlencodedParser, async(req, res)=>{
  const data = req.body;
   let eventName= data.eventName;
   let eventDate= data.eventDate;
   let eventDeadline = data.eventDeadline;
   let fee = data.fee;
   if(!eventDate||!eventName||!eventDeadline||!validateDate(eventDate)||!validateDate(eventDeadline)||(fee&&!isInt(fee))){
    res.status(400).send('invalid entry')
   }else{
    let eventData = JSON.parse(JSON.stringify(req.body));
    eventData.fee = parseInt(eventData.fee);
    res.json(await createEvent(eventData));
   }
 })

 //update event
 router.put('/events/:id', eventMiddleware, urlencodedParser, async(req, res)=>{
   const id = req.params.id;
   let data = req.body;
   let entry = {};
   if(data.eventDate&&validateDate(data.eventDate)){
    entry["eventDate"] = data.eventDate;
   }if(data.eventDeadline&&validateDate(data.eventDeadline)){
    entry["eventDeadline"] = data.eventDeadline;
   }if(data.eventName){
    entry["eventName"] = data.eventName;
   }if(data.fee&&isInt(data.fee)){
    entry["fee"] = parseInt(data.fee);
   }if(data.eventLocation){
    entry["eventLocation"] = data.eventLocation;
   }
   if(!data.eventDate&&!data.eventDeadline&&!data.eventLocation&&!data.fee&&!data.eventName){
    res.status(400).send('invalid entry');
   }
   console.log(entry);
   res.json(await updateEvent(id, entry));
 })

 //delete donor
 router.delete('/events/:id', eventMiddleware, async(req, res)=>{
   const id = req.params.id;
   res.json(await deleteEvent(id))
 })
module.exports=router;