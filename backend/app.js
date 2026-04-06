const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/',(req,res) =>{
    res.status(200).json({message:'MzansiBuilds API is running securely'});
});

module.exports = app;