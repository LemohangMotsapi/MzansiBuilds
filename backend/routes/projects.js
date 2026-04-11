const express = require('express');
const router = express.Router();
const supabase = require('../db'); 
const authenticateToken = require('../middleware/auth');

// 1. STATIC ROUTES FIRST (Prevents shadowing)
router.get('/my-ships', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/celebrations', async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, users ( username )') 
      .eq('status', 'Shipped')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async(req,res) => {
    try{
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', {ascending: false});
        if(error) throw error;
        res.status(200).json({projects: projects});
    } catch(err){
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// 2. DYNAMIC PARAMETER ROUTE LAST
router.get('/:id', async (req, res) => {
  //console.log("!!! ATTENTION: Backend is fetching ID:", req.params.id);
  try {
    const { id } = req.params;
    // CRITICAL: Convert string "65" to Integer for your int8 column
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, users ( username )')
      .eq('id', parseInt(id))
      .single();

    if (error || !project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. MUTATION ROUTES (POST, PUT, DELETE)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, tech_stack, support_required, status} = req.body;
    const userId = req.user.id;
    const { data: project, error } = await supabase
      .from('projects')
      .insert([{ title, description, tech_stack, support_required, user_id: userId, status }])
      .select().single();
    if (error) throw error;
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .select().single();
    if (error) throw error;
    res.status(200).json({ project: updatedProject });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', userId);
    if (error) throw error;
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;