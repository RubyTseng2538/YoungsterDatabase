const {Router} = require('express');
const bodyParser = require('body-parser');
const router = new Router();
const {PaymentMethod} = require("@prisma/client");

const { getDonorById } = require('../CRUD/donor');
const { getTransaction, createTransaction, deleteTransaction, getAllTransactions, getTransactionByNote, getTransactionByDonor, getTransactionByEvent, getTransactionByPaymentMethod, getTransactionByEntryDate, getTransactionByTransactionDate, getAllDonationTransaction } = require('../CRUD/transaction');
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

const transactionMiddleware = (req,res,next) => {
    const id = req.params.id;
    if(!id || isNaN(id) || !isInt(id)){
       return  res.status(400).send("invalid id")
    }
    req.params.id = parseInt(id)
    next()
}

router.get('/transaction', checkPermissionLevel(2), async (req,res)=>{
    const {searchText, EntryDateOne, EntryDateTwo, TransactionDateOne, TransactionDateTwo, DonorID, EventID, payment, donation} = req.query;
    console.log(req.query);
    if(searchText){
      res.send(await getTransactionByNote(searchText));
    }else if(EntryDateOne&&EntryDateTwo&&validateDate2(EntryDateOne)&&validateDate2(EntryDateTwo)){
      res.send(await getTransactionByEntryDate(EntryDateOne, EntryDateTwo));
    }else if(TransactionDateOne&&TransactionDateTwo&&validateDate2(TransactionDateOne)&&validateDate2(TransactionDateTwo)){
      res.send(await getTransactionByTransactionDate(TransactionDateOne, TransactionDateTwo));
    }else if(DonorID&&isInt(DonorID)&&getDonorById(parseInt(DonorID))){
      res.send(await getTransactionByDonor(parseInt(DonorID)))
    }else if(EventID&&isInt(EventID)&&getDonorById(parseInt(EventID))){
      res.send(await getTransactionByEvent(parseInt(EventID)))
    }else if(payment&&convertStringToPaymentMethod(payment)){
      res.send(await getTransactionByPaymentMethod(convertStringToPaymentMethod(payment)))
    }else if(Boolean(donation) == true){
      res.send(await getAllDonationTransaction())
    }else{
      res.send(await getAllTransactions());
    }
    
 })

 //get filter id
 router.get('/transaction/:id',checkPermissionLevel(2), transactionMiddleware,async(req,res)=>{
    const id = req.params.id;
    res.json(await getTransaction(id))
 })

 router.get('/transactionReceipt',checkPermissionLevel(2), async(req,res)=>{
  const {searchText} = req.query;
  if(searchText){
    res.send(await getReceiptsByString(searchText));
  }else{
    res.send(await getAllReceipts());
  }
})

router.get('/transactionReceipt/:id',checkPermissionLevel(2), async(req,res)=>{
  const receiptNumber = req.params.id;
  if(await getReceipt(receiptNumber)){
    res.json(await getReceipt(receiptNumber));
  }else{
    res.status(400).send('invalid receipt id');
  }
})

 //create event
 router.post("/transaction", checkPermissionLevel(2), urlencodedParser, async(req, res)=>{
  const data = req.body;
  let donorID= data.donorID;
  let entryDate= data.entryDate;
  let transactionDate = data.transactionDate;
  let amount = data.amount;
  let donation = isTrue(data.donation);
  let eventID = data.eventID;
  let paymentMethod = convertStringToPaymentMethod(data.paymentMethod);
  let receiptNumber = data.receiptNumber;
  let email = data.email;
  let name = data.name;
  let sendDate = data.sendDate;
  console.log(data, donation);
  if(!entryDate||!donorID||!transactionDate||!paymentMethod||!validateDate(entryDate)||!validateDate(transactionDate)||!isInt(donorID)||(amount&&isNaN(amount))||(eventID&&!isInt(eventID))||donation == null||!email||!name||!receiptNumber||!sendDate||!validateDate(sendDate)||!validateEmail(email)){
    res.status(400).send('invalid entry');
    res.end();
  }else{
    let transactionData = JSON.parse(JSON.stringify(req.body));
    transactionData.amount = parseFloat(transactionData.amount);
    transactionData.donorID = parseInt(transactionData.donorID);
    transactionData.eventID = parseInt(transactionData.eventID);
    transactionData.donation = isTrue(transactionData.donation);
    transactionData.paymentMethod = convertStringToPaymentMethod(transactionData.paymentMethod);

    let tData = {
      entryDate: transactionData.entryDate,
      transactionDate: transactionData.transactionDate,
      donorID: transactionData.donorID,
      eventID: transactionData.eventID,
      amount: transactionData.amount,
      paymentMethod: transactionData.paymentMethod,
      receiptID: transactionData.receiptNumber,
      donation: transactionData.donation,
      note: transactionData.note
    }

    let rData = {
      receiptNumber: transactionData.receiptNumber,
      email: transactionData.email,
      name: transactionData.name,
      sendDate: transactionData.sendDate
    }

    console.log(tData, rData);
    res.json(await createTransaction(tData, rData));
  }
  
 })

 //delete transaction
 router.delete('/transaction/:id',checkPermissionLevel(2), transactionMiddleware, async(req, res)=>{
   const id = req.params.id;
   res.json(await deleteTransaction(id))
 })
module.exports=router;
