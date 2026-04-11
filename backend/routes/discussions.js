const express = require('express');
// mergeParams: true allows us to access :projectId from the parent URL
const router = express.Router({ mergeParams: true }); 
const supabase = require('../db');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, parent_id, type } = req.body; // type is now optional
    const userId = req.user.id;

    // Only content is strictly required now
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const { data: post, error } = await supabase
      .from('project_discussions')
      .insert([{ 
        project_id: parseInt(projectId), 
        user_id: userId,
        content: content, 
        parent_id: parent_id ? parseInt(parent_id): null,
        type: type || 'COMMENT' // Default to COMMENT if not provided
      }])
      .select('*, users(username)')
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      return res.status(500).json({ error: 'Failed to post message' });
    }

    res.status(201).json({ message: 'Post synchronized', post });
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
      .eq('project_id', parseInt(projectId))
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({ discussions: discussions });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;