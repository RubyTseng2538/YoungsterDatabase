const express = require('express');
const donorRoutes = require('./API/donorRoute');
const eventRoutes = require('./API/eventRoute');
const transactionRoutes = require('./API/transactionRoute');


const { isAuthenticated} = require('./API/APIAuthentication');
// Step 1: Import express-session


const app = express();
const port = 3000;

// Note: Make sure the above code is placed before your routes that require authentication.

app.use(isAuthenticated);

app.use('/api/v1', [donorRoutes, eventRoutes, transactionRoutes]);

app.get('/', (_, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

