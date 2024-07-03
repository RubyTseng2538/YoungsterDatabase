const express = require('express');
// const bodyParser = require('body-parser');
const app = express();
const donorRoutes = require('./API/donorRoute');
const eventRoutes = require('./API/eventRoute');
const port = 3000

app.use('/api/v1',[donorRoutes, eventRoutes])

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
