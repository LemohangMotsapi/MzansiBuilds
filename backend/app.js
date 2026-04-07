const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const projectRoutes = require('./routes/projects');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/',(req,res) =>{
    res.status(200).json({message:'MzansiBuilds API is running securely'});
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

module.exports = app;