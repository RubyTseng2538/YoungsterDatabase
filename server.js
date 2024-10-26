const express = require('express');
const donorRoutes = require('./API/donorRoute');
const eventRoutes = require('./API/eventRoute');
const transactionRoutes = require('./API/transactionRoute');


const { isAuthenticated, checkUserInSystem} = require('./API/APIAuthentication');
// Step 1: Import express-session



const app = express();
const port = 3000;
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Note: Make sure the above code is placed before your routes that require authentication.

app.use(isAuthenticated);
app.use(checkUserInSystem);

app.use('/api/v1', [donorRoutes, eventRoutes, transactionRoutes]);

app.get('/', (_, res) => {
    res.send('Hello World!');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on 0.0.0.0:${port}`);
});

