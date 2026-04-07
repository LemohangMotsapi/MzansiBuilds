const express = require('express');
const router = express.Router();
const supabase = require('../db'); 
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, tech_stack } = req.body;

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
          user_id: userId 
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
        const { data:projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', {ascending: false});
        if(error){
            console.error("Supabase Error:", error.message);
            return res.status(500).json({error: 'Failed to fetch projects from database'});
        }

        res.status(200).json({projects:projects});
    } catch(err){
        console.error("Server Error:", err.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;