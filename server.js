const express = require('express');
const cookieParser = require('cookie-parser');
const donorRoutes = require('./API/donorRoute');
const eventRoutes = require('./API/eventRoute');
const transactionRoutes = require('./API/transactionRoute');

const { google } = require('googleapis');

const {OAuth2Client} = require('google-auth-library');
const { isAuthenticated, checkUserInSystem } = require('./API/APIAuthentication');
require('dotenv').config(); 
// Step 1: Import express-session


const app = express();
const port = 3000;

app.use(cookieParser());

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Note: Make sure the above code is placed before your routes that require authentication.
app.get('/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
      ],
    });
    res.redirect(url);
  });
  
app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        res.cookie('token', tokens.id_token);
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If the request specified a Google Workspace domain:
        // const domain = payload['hd'];

        const oauth2 = google.oauth2({auth: oauth2Client, version: 'v2'});
        const userInfo = await oauth2.userinfo.get();
        console.log(userInfo.data);
        res.cookie('user', userInfo.data);
        // Here, you can also redirect the user to another page or perform further actions
        checkUserInSystem(req, res, () => {
            res.redirect('/'); // Redirect to homepage on successful authentication
        });
    } catch (error) {
        console.error('Error during authentication:', error);
        res.redirect('/?error=authentication_failed'); // Redirect to homepage with an error message on failure
    }
});

// app.use(isAuthenticated);

app.use('/api/v1', [donorRoutes, eventRoutes, transactionRoutes]);

app.get('/', (_, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

