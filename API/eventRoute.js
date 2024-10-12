const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();

const { getAllEvents, getEventsByName, getEvent, createEvent, updateEvent, deleteEvent, addAttendees, removeAttendees, getEventsByDateRange, getEventsByDeadlineRange, getEventsByDonor, getEventsByUser, getEventsByNameCoordinator, getEventsByDonorCoordinator, getEventsByDateRangeCoordinator, getEventsByDeadlineRangeCoordinator, getActiveEvents } = require('../CRUD/event');
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
router.get('/events' , async (req,res)=>{
  try{
    const {searchText, DateOne, DateTwo, DeadlineOne, DeadlineTwo, DonorID} = req.query;
    console.log(req.query);
    // if(req.permissionLevel==0){
    //   if(searchText){
    //     res.send(await getEventsByNameCoordinator(searchText, req.user));
    //   }else if(DateOne&&DateTwo&&validateDate2(DateOne)&&validateDate2(DateTwo)){
    //     res.send(await getEventsByDateRangeCoordinator(DateOne, DateTwo));
    //   }else if(DeadlineOne&&DeadlineTwo&&validateDate2(DeadlineOne)&&validateDate2(DeadlineTwo)){
    //     res.send(await getEventsByDeadlineRangeCoordinator(DeadlineOne, DeadlineTwo));
    //   }else if(DonorID&&isInt(DonorID)&&getDonorById(parseInt(DonorID))){
    //     res.send(await getEventsByDonorCoordinator(parseInt(DonorID), req.user))
    //   }else{
    //     res.send(await getEventsByUser(req.user));
    //   }
    // }else{
      if(searchText){
        res.send(await getEventsByName(searchText));
      }else if(DateOne&&DateTwo&&validateDate2(DateOne)&&validateDate2(DateTwo)){
        res.send(await getEventsByDateRange(DateOne, DateTwo));
      }else if(DeadlineOne&&DeadlineTwo&&validateDate2(DeadlineOne)&&validateDate2(DeadlineTwo)){
        res.send(await getEventsByDeadlineRange(DeadlineOne, DeadlineTwo));
      }else if(DonorID&&isInt(DonorID)&&getDonorById(parseInt(DonorID))){
        res.send(await getEventsByDonor(parseInt(DonorID)))
      }else{
        res.send(await getActiveEvents());
      }
    // }
  }catch(error){
    console.error('Error fetching events:', error);
    res.status(500).send('Internal Server Error');
  } 
    
 })

 //get filter id
 router.get('/events/:id', eventMiddleware, async (req, res) => {
  try {
      const id = req.params.id;
      const event = await getEvent(id);
      if(event==null){
            res.status(404).send('Event not found');
      }else{
        res.json(event);
      }
  } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).send('Internal Server Error');
  }
});


 //make a check that make sure deadline is before date.
 //create event
 router.post("/events", urlencodedParser, async (req, res) => {
  try {
      const data = req.body;
      let eventName = data.eventName;
      let eventDate = data.eventDate;
      let eventDeadline = data.eventDeadline;
      let fee = data.fee;
      let eventStatus = data.eventStatus;

      if (!eventDate || !eventName || !eventDeadline || !validateDate(eventDate) || !validateDate(eventDeadline) || (fee && !isInt(fee))) {
          res.status(400).send('invalid entry');
      } else {
          let eventData = {
              eventName,
              eventDate,
              eventDeadline,
              fee: parseInt(fee),
              eventStatus
          }
          res.json(await createEvent(eventData));
      }
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

 //update event
 router.put('/events/:id', eventMiddleware, urlencodedParser, async (req, res) => {
  try {
      const id = req.params.id;
      let data = req.body;
      let entry = {};

      if(data.eventDate&&validateDate(data.eventDate)){
        entry["eventDate"]=data.eventDate;
      }
      if (data.eventDeadline&&validateDate(data.eventDeadline)) {
          entry["eventDeadline"] = data.eventDeadline;
      }
      if (data.eventName) {
          entry["eventName"] = data.eventName;
      }
      if (data.fee && isInt(data.fee)) {
          entry["fee"] = parseInt(data.fee);
      }
      if (data.eventLocation) {
          entry["eventLocation"] = data.eventLocation;
      }if(data.eventStatus && (data.eventStatus=="ACTIVE"||data.eventStatus=="INACTIVE")){
        entry["eventStatus"]=data.event;
      }
      if (!(data.eventDate&&validateDate(data.eventDate)) && !(data.eventDeadline&&validateDate(data.eventDeadline)) && !data.eventLocation && !(data.fee&&isInt(data.fee) )&& !data.eventName) {
          return res.status(400).send('invalid entry');
      }

      console.log(entry);
      res.json(await updateEvent(id, entry));
  } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.put('/events/addAttendees/:id', eventMiddleware, urlencodedParser, async (req, res) => {
  try {
      const id = req.params.id;
      let data = req.body;

      if (data.userID && isInt(data.userID) && await getDonorById(parseInt(data.userID))) {
          res.json(await addAttendees(id, parseInt(data.userID)));
      } else {
          res.status(400).send('invalid entry');
      }
  } catch (error) {
      console.error('Error adding attendees:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.put('/events/removeAttendees/:id', eventMiddleware, urlencodedParser, async (req, res) => {
  try {
      const id = req.params.id;
      let data = req.body;

      if (data.userID && isInt(data.userID) && await getDonorById(parseInt(data.userID))) {
          res.json(await removeAttendees(id, parseInt(data.userID)));
      } else {
          res.status(400).send('invalid entry');
      }
  } catch (error) {
      console.error('Error removing attendees:', error);
      res.status(500).send('Internal Server Error');
  }
});

 //delete donor
 router.delete('/events/:id', eventMiddleware, async(req, res)=>{
  try{
    const id = req.params.id;
    const event = await getEvent(id);
    if(event==null){
      res.status(404).send('Event not found');
    }else{
      await deleteEvent(id);
      res.status(204).send();
    }
  }catch(error){
    res.status(500).send('Internal Server Error');
  }
   
 })
module.exports=router;