const jwt = require('jsonwebtoken');
const {Router} = require('express');
const router = new Router();
const bodyParser = require('body-parser');
const { updateUser, getUserById, getUserByEmail, createUser } = require('../CRUD/user');
const {getConfig} = require('../CRUD/receiptConfig');
const bcrypt = require('bcrypt');

let urlencodedParser = bodyParser.urlencoded({ extended: false });

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

router.post('/login', urlencodedParser, async (req, res) => {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    const [userID, userName, userEmail] = [user.id, user.name, user.email];
    if (user) {
        bcrypt.compare(password, user.password, function(err, result) {
            if(err){
                res.status(500).send('Error on server side');
            }
            if(result){
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token, userID, userName, userEmail });
            }else{
                console.log('Invalid email or password');
                res.status(401).send('Invalid email or password');
            }
        });
    }else{
        console.log('Please register first');
        res.status(401).send("Please register first");
    } 
});

router.post('/register', urlencodedParser, async (req, res) => {
    const { name, email, password } = req.body;
    if(!validateEmail(email)){
        res.status(400).send('Invalid email');
    }
    const user = await getUserByEmail(email);
    if (user) {
        res.status(400).send('User already exists');
    } else {
        let config = await getConfig("ZDY");
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if(err){
                res.status(500).send('Error hashing password');
            }else{
                const data = {
                    name: name,
                    email: email,
                    password: hash,
                    receiptPrefix: config.prefix
                }
                const newUser = createUser(data);
                res.json(newUser);
            }
         });
    }
});

module.exports = router;
