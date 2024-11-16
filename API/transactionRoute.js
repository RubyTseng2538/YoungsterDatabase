const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();
const {PaymentMethod, TransactionType, Status} = require("@prisma/client");

const { getDonorById } = require('../CRUD/donor');
const { getTransaction, createTransaction, getAllTransactions, manualSendReceipt, editTransaction, getDynamicFilteredTransactions, getActiveTransactions } = require('../CRUD/transaction');
const { getReceipt, getReceiptsByString, getAllReceipts, createOrUpdateReceipt } = require('../CRUD/transactionReceipt');
const { checkPermissionLevel } = require('./APIAuthorization');

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

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const isTrue = (boolean)=>{
  return boolean.toLowerCase() === "true"
}

const convertStringToPaymentMethod = (method)=>{
  if(method == "CASH"){
    return PaymentMethod.CASH;
  }else if(method == "CHECK"){
    return PaymentMethod.CHECK;
  }else if(method == "ZELLE"){
    return PaymentMethod.ZELLE;
  }else{
    return false;
  }
}

const convertStringToTransactionType = (type)=>{
  if(type == "DEPOSIT"){
    return TransactionType.DEPOSIT;
  }else if(type == "EXPENSE"){
    return TransactionType.EXPENSE;
  }else{
    return false;
  }
}

const convertStringToStatus = (status)=>{
  if(status == "PENDING"){
    return Status.PENDING;
  }else if(status == "COMPLETED"){
    return Status.COMPLETED;
  }else if(status == "VOID"){
    return Status.VOID;
  }else{
    return false;
  }
}

const transactionMiddleware = (req,res,next) => {
    const id = req.params.id;
    if(!id || isNaN(id) || !isInt(id)){
       return  res.status(400).send("invalid id")
    }
    req.params.id = parseInt(id)
    next()
}

router.get('/transaction', async (req,res)=>{
  // try{
  let filter = {}; 
  let paymentFilter =[];
  let statusFilter = [];
  const {EntryDateOne, EntryDateTwo, TransactionDateOne, TransactionDateTwo, DonorID, EventID, payment, transactionType, status, receipt, all} = req.query;
    console.log(req.query);
    let paymentList = [];
    let statusList = [];
    if(payment){
      paymentList = payment.split(",");
      for(let i = 0; i < paymentList.length; i++){
        paymentList[i]=convertStringToPaymentMethod(paymentList[i]);
        
      }
    }if(status){
      statusList = status.split(","); 
      for(let i = 0; i < statusList.length; i++){
        statusList[i]=convertStringToStatus(statusList[i]);
        
      }
    }
    if(EntryDateOne&&EntryDateTwo&&validateDate(EntryDateOne)&&validateDate(EntryDateTwo)){
      filter.entryDate= {gte: EntryDateOne, lte: EntryDateTwo};
    }if(TransactionDateOne&&TransactionDateTwo&&validateDate(TransactionDateOne)&&validateDate(TransactionDateTwo)){
      filter.transactionDate= {gte: TransactionDateOne, lte: TransactionDateTwo};
    }if(DonorID&&isInt(DonorID)&&getDonorById(parseInt(DonorID))){
      filter.donorID = parseInt(DonorID);
    }if(EventID&&isInt(EventID)&&getDonorById(parseInt(EventID))){
      filter.eventID= parseInt(EventID);
    }if(paymentList.length > 1){
      paymentFilter.push(...paymentList.map(payment => ({ paymentMethod: payment })));
    }else if(paymentList.length == 1){
      filter.paymentMethod = paymentList[0];
    }
    if(transactionType&&convertStringToTransactionType(transactionType)){
      filter.transactionType= convertStringToTransactionType(transactionType);
    }if(statusList.length > 1){
      statusFilter.push(...statusList.map(status => ({ status: status })));
    }else if(statusList.length == 1){
      filter.status = statusList[0];
    }if(receipt){
      filter.receiptID= {not: null};
    }if(all){
      filter.status= {not: Status.VOID};
    }if(paymentFilter.length > 1 && statusFilter.length > 1){
      filter.AND = [{OR: paymentFilter},{OR: statusFilter}];
      console.log("and")
    }else if(paymentFilter.length > 1){
      filter.OR = paymentFilter;
    }else if(statusFilter.length > 1){
      filter.OR = statusFilter;
    }
    if(filter.length == 0){
      res.send(await getAllTransactions());
    }else{
      res.send(await getDynamicFilteredTransactions(filter));
    }
  // }catch(e){
  //   res.status(500).send('Internal Server Error');
  // }
 })

 //get filter id
 router.get('/transaction/:id', transactionMiddleware,async(req,res)=>{
  try{
    const id = req.params.id;
    res.json(await getTransaction(id));
  }catch(e){
    res.status(500).send('Internal Server Error');
  }
 })

 router.get('/transactionReceipt', async(req,res)=>{
  try{
    const {searchText} = req.query;
    if(searchText){
      res.send(await getReceiptsByString(searchText));
    }else{
      res.send(await getAllReceipts());
    }
  }catch(e){
    res.status(500).send('Internal Server Error');
  }
})

router.get('/transactionReceipt/:id', async(req,res)=>{
  try{
    const receiptNumber = req.params.id;
    if(await getReceipt(receiptNumber)){
      res.json(await getReceipt(receiptNumber));
    }else{
      res.status(400).send('invalid receipt id');
    }
  }catch(e){
    res.status(500).send('Internal Server Error');
  }
})

router.get('/transaction/sendReceipt/:id', transactionMiddleware, async(req,res)=>{
  try{
    const transactionID = req.params.id;
    res.json(await manualSendReceipt(transactionID));
  }
  catch(e){
    res.status(500).send('Internal Server Error');
  }
})

 //create event
 router.post("/transaction", urlencodedParser, async(req, res)=>{
  try{
    const data = req.body;
    
    let transactionDate = data.transactionDate;
    let donorID= parseInt(data.donorID);
    let eventID = parseInt(data.eventID);
    let paymentMethod = convertStringToPaymentMethod(data.paymentMethod);
    let amount = parseInt(data.amount);
    let referenceNumber = data.referenceNumber;
    let transactionType = convertStringToTransactionType(data.transactionType);
    let status = convertStringToStatus(data.status);
    let email = data.email;
    let name = data.name;
    let note = data.note;
    if(!donorID||!transactionDate||!paymentMethod||!validateDate(transactionDate)||!isInt(donorID)||(amount&&isNaN(amount))||(eventID&&!isInt(eventID))||!transactionType||!status){
      res.status(400).send('invalid entry');
      res.end();
    }
    if(email&&!validateEmail(email)){
      res.status(400).send('invalid email');
      res.end();
    }if(!email){
      let tData = {
        transactionDate,
        paymentMethod,
        amount,
        donorID,
        eventID,
        referenceNumber,
        transactionType,
        status,
        note,
      }
      res.json(await createTransaction(req.user.id, tData, tData.donorID, tData.eventID));
    }
    else{

      let tData = {
        transactionDate,
        paymentMethod,
        amount,
        donorID,
        eventID,
        referenceNumber,
        transactionType,
        status,
        note,
      }

      let rData = {
        email,
        name
      }

      res.json(await createTransaction(req.user.id, tData, tData.donorID, tData.eventID, rData));
    }
  }catch(e){
    console.error('Error creating transaction:', e);
    res.status(500).send('Internal Server Error');
  }
  
 })

 //new route for sending receipt via email
 router.post('/transaction/sendReceipt/:id', transactionMiddleware, urlencodedParser, async(req, res)=>{
  try{
    const transactionID = req.params.id;
    if(transactionID&&isInt(transactionID)){
      res.json(await manualSendReceipt(transactionID));
    }else{
      res.status(400).send('invalid transaction id');
    }
  }catch(e){
    res.status(500).send('Internal Server Error');
  }
 })

router.post('/transaction/createOrUpdate/:id', transactionMiddleware, urlencodedParser, async(req, res)=>{
  // try{
    const transactionID = req.params.id;
    if(transactionID&&isInt(transactionID)){
      const data = req.body;
      let name = data.name;
      let email = data.email;
      if(name||(email&&validateEmail(email))){
        res.json(await createOrUpdateReceipt(transactionID, {name, email}, req.user.id));
      }else{
        res.status(400).send('invalid entry');
      }
    }else{
      res.status(400).send('invalid transaction id');
    }

  // }catch(e){
  //   res.status(500).send('Internal Server Error');
  // }
})

 //delete transaction
 router.delete('/transaction/:id', transactionMiddleware, async(req, res)=>{
  try{
   const id = req.params.id;
   res.json(await editTransaction(id, {status: Status.VOID}));
  }catch(e){
    res.status(500).send('Internal Server Error');
  }
 })
module.exports=router;
