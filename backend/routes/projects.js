const express = require('express');
const router = express.Router();
const supabase = require('../db'); 
const authenticateToken = require('../middleware/auth');

router.get('/my-ships', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, project_collaborations(count)')
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
      .select('*, users (username), live_url, project_collaborations(count), clap_count:project_claps(count)') 
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
            .select('*, users (username), project_collaborations(count)')
            .order('created_at', {ascending: false});
        if(error) throw error;
        res.status(200).json({projects: projects});
    } catch(err){
        res.status(500).json({error: 'Internal Server Error'});
    }
});

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

router.post('/:id/collaborate', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { id: helperId, username: helperName } = req.user;

    const { error: collabError } = await supabase
      .from('project_collaborations')
      .insert([{ project_id: projectId, user_id: helperId }]);

    if (collabError) {
      if (collabError.code === '23505') {
        return res.status(400).json({ error: "You have already raised your hand for this project!" });
      }
      throw collabError;
    }

    await supabase
      .from('project_discussions')
      .insert([{
        project_id: projectId,
        user_id: helperId,
        content: `✋ @${helperName} raised their hand to collaborate on this project!`,
        type: 'COMMENT'
      }]);

    res.status(201).json({ message: "Collaboration request logged." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/clap", authenticateToken, async(req,res) => {
  const { id }= req.params;
  const userId = req.user.id;

  const{ error } = await supabase
    .from("project_claps")
    .insert([{project_id: parseInt(id), user_id:userId}]);

  if (error){
    console.error("Clap Error:", error);
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: "CLAP SUCCESSFUL" });
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: check, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', parseInt(id))
      .single();

    if (!check || check.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', parseInt(id))
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, users (username), project_collaborations(count)')
      .eq('id', parseInt(id))
      .single();

    if (error || !project) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;