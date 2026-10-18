const app = require('./app');
const appp = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 8080;
app.listen(PORT,()=>{
    console.log(`Server is running very very on port ${PORT}`);
});