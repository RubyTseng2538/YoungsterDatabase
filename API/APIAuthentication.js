
const {OAuth2Client} = require('google-auth-library');
const { updateUser, getUserById, getUserByEmail } = require('../CRUD/user');

const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


async function isAuthenticated(req, res, next) {
    // Extract the token from the Authorization header
    try {
        // Extract the token from the cookie
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            console.log('Token missing');
            return res.status(401).send('Token missing');
        }
        if (process.env.APP_ENV === 'dev') {
            req.user = {
                id: '123',
                email: 'rubytseng54@gmail.com'
            }
            next();
        }else if(process.env.APP_ENV === 'test'){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        }
        
        else{

        const ticket = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });

        const payload = ticket.getPayload();
        const userid = payload['sub'];

        req.user = {
            id: userid,
            email: payload['email']
        }
        // Proceed to the next middleware or route handler
        next();
    }} catch (error) {
        console.error('Error during token verification:', error);
        res.status(401).send('Invalid token');
    }
}

async function checkUserInSystem(req, res, next) {
    try {
        const user = req.user;
       // at the end , re.user should = db.user
        let userInSystem = await getUserById(user.id);
        if(!userInSystem){
            userInSystem = await getUserByEmail(user.email);
            if(!userInSystem){
                return res.status(401).send('User not in the system');
            }else{
                updateUser(userInSystem.id, {GoogleId: user.id});
                next();
            }
        }else{
            next();
        }

    }catch(error){
        console.error('User not in the system:', error);
        res.status(401).send('User not in the system');
    }
}


module.exports = { isAuthenticated, checkUserInSystem };

