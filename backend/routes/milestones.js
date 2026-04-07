const express = require('express');
// mergeParams: true is the magic that pulls the :projectId from the URL!
const router = express.Router({ mergeParams: true }); 
const supabase = require('../db');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    if (!title || !status) {
      return res.status(400).json({ error: 'Title and status are required' });
    }

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      return res.status(404).json({ error: 'Parent project not found' });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this project' });
    }

    const { data: milestone, error: insertError } = await supabase
      .from('milestones')
      .insert([{ 
        project_id: projectId, 
        title: title, 
        description: description, 
        status: status 
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: 'Milestone added successfully', milestone });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({ milestones });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;