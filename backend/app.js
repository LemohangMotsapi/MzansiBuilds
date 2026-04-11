const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const projectRoutes = require('./routes/projects');
const milestoneRoutes = require('./routes/milestones');
const discussionRoutes = require('./routes/discussions');
const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'MzansiBuilds API is running securely' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/milestones', milestoneRoutes);
app.use('/api/projects/:projectId/discussions', discussionRoutes);

module.exports = app;