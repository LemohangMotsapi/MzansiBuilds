const express = require('express');
const router = express.Router();
const supabase = require('../db'); 
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, tech_stack, support_required, status} = req.body;

    if (!title || !tech_stack) {
      return res.status(400).json({ error: 'Title and tech_stack are required' });
    }

    const userId = req.user.id;

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        { 
          title: title, 
          description: description, 
          tech_stack: tech_stack, 
          support_required: support_required,
          user_id: userId,
          status: status
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(500).json({ error: 'Failed to save project to database' });
    }

    res.status(201).json({
      message: 'Project created successfully',
      project: project
    });

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async(req,res) => {
    try{
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', {ascending: false});
        if(error){
            console.error("Supabase Error:", error.message);
            return res.status(500).json({error: 'Failed to fetch projects from database'});
        }

        res.status(200).json({projects: projects});
    } catch(err){
        console.error("Server Error:", err.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


router.get('/celebrations', async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        users ( username )
      `) 
      .eq('status', 'Completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(500).json({ error: 'Failed to fetch the Celebration Wall' });
    }

    res.status(200).json({ 
      message: 'Welcome to the Celebration Wall!',
      projects: projects 
    });

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tech_stack, status, support_required } = req.body;
    const userId = req.user.id; 

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this project' });
    }

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ 
        title: title, 
        description: description, 
        tech_stack: tech_stack, 
        status: status,
        support_required: support_required
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Project updated', project: updatedProject });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this project' });
    }

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.status(200).json({ message: 'Project successfully deleted' });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;