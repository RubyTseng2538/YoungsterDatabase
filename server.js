const express = require('express')
const app = express();
const donorRoutes = require('./API/donorRoute');
const port = 3000

app.use('/api/v1',[donorRoutes])
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})