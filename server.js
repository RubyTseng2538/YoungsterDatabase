const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const donorRoutes = require('./API/donorRoute');
const eventRoutes = require('./API/eventRoute');
const transactionRoutes = require('./API/transactionRoute');
require('dotenv').config(); 
// Step 1: Import express-session
const session = require('express-session');
const { getUserById } = require('./CRUD/user');

const app = express();
const port = 3000;

passport.use(
    new GoogleStrategy({
        clientID: '699961587857-tt6mg3bpr2nock1oc5nugucvkf15hjq9.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        console.log(profile);
      done(null, profile);
    })
);

// Serialize User
passport.serializeUser((user, done) => {
  done(null, user.id); // 'user.id' should be replaced with how you identify users in your application
});

// Deserialize User
passport.deserializeUser((id, done) => {
  // Here you find the user by ID. This example assumes you have a 'findUserById' function.
  getUserById(id, (err, user) => {
      done(err, user);
  });
  done(null, id);
});

app.use(session({
  secret: process.env.SESSION_SECRET_kEY, // This is a secret key for your session. You should store it in an environment variable.
  resave: false, // This option forces the session to be saved back to the session store, even if the session was never modified during the request.
  saveUninitialized: false, // This option forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
  cookie: { secure: false } // This should be set to true in a production environment with HTTPS
}));

// Step 3: Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // This tells Passport to use session support.

// Note: Make sure the above code is placed before your routes that require authentication.

app.use('/api/v1', [donorRoutes, eventRoutes, transactionRoutes]);

app.get('/', (_, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "http://localhost:3000/api/v1/donors",
        failureRedirect: "http://localhost:3000/",
    })
);

