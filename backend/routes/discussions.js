const express = require('express');
// mergeParams: true allows us to access :projectId from the parent URL
const router = express.Router({ mergeParams: true }); 
const supabase = require('../db');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, type } = req.body;
    const userId = req.user.id;

    if (!content || !type) {
      return res.status(400).json({ error: 'Content and type (COMMENT/QUESTION) are required' });
    }

    const { data: discussion, error } = await supabase
      .from('project_discussions')
      .insert([
        { 
          project_id: projectId, 
          user_id: userId, 
          content: content, 
          type: type, 
          is_resolved: false 
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }

    res.status(201).json({ 
      message: 'Discussion post created successfully', 
      discussion: discussion 
    });

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data: discussions, error } = await supabase
      .from('project_discussions')
      .select(`
        *,
        users ( username )
      `) // This joins the users table so we can see WHO posted it!
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({ discussions: discussions });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;