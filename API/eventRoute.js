const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();

const { getAllEvents, getEventsByName, getEvent, createEvent, updateEvent, deleteEvent, addAttendees, removeAttendees, getEventsByDateRange, getEventsByDeadlineRange, getEventsByDonor, getEventsByUser, getEventsByNameCoordinator, getEventsByDonorCoordinator, getEventsByDateRangeCoordinator, getEventsByDeadlineRangeCoordinator } = require('../CRUD/event');
const { getDonorById } = require('../CRUD/donor');
const { checkPermissionLevel, eventCoordinators } = require('./APIAuthorization');

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

const validateDate2 = (Date)=>{
  return String(Date).match(
    /^(0[1-9]|1[1,2])(\/|-)(0[1-9]|[12][0-9]|3[01])(\/|-)(19|20)\d{2}$/
  );
}


const eventMiddleware = (req,res,next) => {
    const id = req.params.id;
    if(!id || isNaN(id) || !isInt(id)){
       return  res.status(400).send("invalid id")
    }
    req.params.id = parseInt(id)
    next()
}

//get list of donor & get filter name | email
router.get('/events' , checkPermissionLevel(0), async (req,res)=>{
    const {searchText, DateOne, DateTwo, DeadlineOne, DeadlineTwo, DonorID} = req.query;
    console.log(req.query);
    if(req.permissionLevel==0){
      if(searchText){
        res.send(await getEventsByNameCoordinator(searchText, req.user));
      }else if(DateOne&&DateTwo&&validateDate2(DateOne)&&validateDate2(DateTwo)){
        res.send(await getEventsByDateRangeCoordinator(DateOne, DateTwo));
      }else if(DeadlineOne&&DeadlineTwo&&validateDate2(DeadlineOne)&&validateDate2(DeadlineTwo)){
        res.send(await getEventsByDeadlineRangeCoordinator(DeadlineOne, DeadlineTwo));
      }else if(DonorID&&isInt(DonorID)&&getDonorById(parseInt(DonorID))){
        res.send(await getEventsByDonorCoordinator(parseInt(DonorID), req.user))
      }else{
        res.send(await getEventsByUser(req.user));
      }
    }else{
      if(searchText){
        res.send(await getEventsByName(searchText));
      }else if(DateOne&&DateTwo&&validateDate2(DateOne)&&validateDate2(DateTwo)){
        res.send(await getEventsByDateRange(DateOne, DateTwo));
      }else if(DeadlineOne&&DeadlineTwo&&validateDate2(DeadlineOne)&&validateDate2(DeadlineTwo)){
        res.send(await getEventsByDeadlineRange(DeadlineOne, DeadlineTwo));
      }else if(DonorID&&isInt(DonorID)&&getDonorById(parseInt(DonorID))){
        res.send(await getEventsByDonor(parseInt(DonorID)))
      }else{
        res.send(await getAllEvents());
      }
    }
    
    
 })

 //get filter id
 router.get('/events/:id' , checkPermissionLevel(0), eventCoordinators, eventMiddleware,async(req,res)=>{
    const id = req.params.id;
    if(req.permissionLevel==0){
      console.log(req.eventIds);
      if(req.eventIds.includes(id)){
        res.json(await getEvent(id));
      }else{
        res.status(403).send('insufficient permissions');
      }
    }else{
      res.json(await getEvent(id));
    }
 })

 //create event
 router.post("/events", checkPermissionLevel(2), urlencodedParser, async(req, res)=>{
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
 router.put('/events/:id',checkPermissionLevel(2), eventMiddleware, urlencodedParser, async(req, res)=>{
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

 router.put('/events/addAttendees/:id',checkPermissionLevel(2), eventMiddleware, urlencodedParser, async(req,res)=>{
  const id = req.params.id;
  let data = req.body;
  if(data.userID&&isInt(data.userID)&&getDonorById(parseInt(data.userID))){
    res.json(await addAttendees(id, parseInt(data.userID)))
  }else{
    res.status(400).send('invalid entry');
  }
 })

 router.put('/events/removeAttendees/:id',checkPermissionLevel(2), eventMiddleware, urlencodedParser, async(req,res)=>{
  const id = req.params.id;
  let data = req.body;
  if(data.userID&&isInt(data.userID)&&getDonorById(parseInt(data.userID))){
    res.json(await removeAttendees(id, parseInt(data.userID)))
  }else{
    res.status(400).send('invalid entry');
  }
 })

 //delete donor
 router.delete('/events/:id',checkPermissionLevel(2), eventMiddleware, async(req, res)=>{
   const id = req.params.id;
   res.json(await deleteEvent(id))
 })
module.exports=router;