const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();
const {PaymentMethod, TransactionType, Status} = require("@prisma/client");

const { getDonorById } = require('../CRUD/donor');
const { getTransaction, createTransaction, deleteTransaction, getAllTransactions, getTransactionByNote, getTransactionByDonor, getTransactionByEvent, getTransactionByPaymentMethod, getTransactionByEntryDate, getTransactionByTransactionDate, getAllDonationTransaction, editTransaction, getDynamicFilteredTransactions } = require('../CRUD/transaction');
const { getReceipt, getReceiptsByString, getAllReceipts } = require('../CRUD/transactionReceipt');
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
  }else if(status == "COMPLETE"){
    return Status.COMPLETE;
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
  try{
  let filter = {};  
  const {EntryDateOne, EntryDateTwo, TransactionDateOne, TransactionDateTwo, DonorID, EventID, payment, transactionType, status} = req.query;
    console.log(req.query);
    if(EntryDateOne&&EntryDateTwo&&validateDate2(EntryDateOne)&&validateDate2(EntryDateTwo)){
      filter.entryDate= {gte: EntryDateOne, lte: EntryDateTwo};
    }if(TransactionDateOne&&TransactionDateTwo&&validateDate2(TransactionDateOne)&&validateDate2(TransactionDateTwo)){
      filter.transactionDate= {gte: TransactionDateOne, lte: TransactionDateTwo};
    }if(DonorID&&isInt(DonorID)&&getDonorById(parseInt(DonorID))){
      filter.donorID = parseInt(DonorID);
    }if(EventID&&isInt(EventID)&&getDonorById(parseInt(EventID))){
      filter.eventID= parseInt(EventID);
    }if(payment&&convertStringToPaymentMethod(payment)){
      filter.paymentMethod= convertStringToPaymentMethod(payment);
    }if(transactionType&&convertStringToTransactionType(transactionType)){
      filter.transactionType= convertStringToTransactionType(transactionType);
    }if(status&&convertStringToStatus(status)){
      filter.status= convertStringToStatus(status);
    }
    if(filter.length == 0){
      res.send(await getAllTransactions());
    }else{
      res.send(await getDynamicFilteredTransactions(filter));
    }
  }catch(e){
    res.status(500).send('Internal Server Error');
  }
 })

 //get filter id
 router.get('/transaction/:id', transactionMiddleware,async(req,res)=>{
  try{
    const id = req.params.id;
    res.json(await getTransaction(id))
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

 //create event
 router.post("/transaction", urlencodedParser, async(req, res)=>{
  try{
    const data = req.body;
    
    let entryDate= data.entryDate;
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
    let sendDate = data.sendDate;
    let note = data.note;
    if(!entryDate||!donorID||!transactionDate||!paymentMethod||!validateDate(entryDate)||!validateDate(transactionDate)||!isInt(donorID)||(amount&&isNaN(amount))||(eventID&&!isInt(eventID))||!email||!name||!sendDate||!validateDate(sendDate)||!validateEmail(email)||!transactionType||!status){
      res.status(400).send('invalid entry');
      res.end();
    }else{

      let tData = {
        entryDate,
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
        name,
        sendDate,
      }

      console.log(tData, rData);
      res.json(await createTransaction(req.user.id, tData, tData.donorID, tData.eventID, rData));
    }
  }catch(e){
    console.error('Error creating transaction:', e);
    res.status(500).send('Internal Server Error');
  }
  
 })

 //new route for sending receipt via email

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
