import pool from '../db/connection.js';

// Admin - create job
export const createJob = async (req, res) => {
  const { title, description, client_id, scheduled_at } = req.body;

  if (!title || !client_id) {
    return res.status(400).json({ message: 'Title and client are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO jobs (title, description, client_id, scheduled_at)
       VALUES (?, ?, ?, ?)`,
      [title, description || null, client_id, scheduled_at || null]
    );

    // notification for client
    await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [client_id, `A new job "${title}" has been created for you.`]
    );

    res.status(201).json({ message: 'Job created', jobId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin - status update (override)
export const adminUpdateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [job] = await pool.query(`SELECT * FROM jobs WHERE id = ?`, [id]);
    if (job.length === 0) return res.status(404).json({ message: 'Job not found' });

    await pool.query(`UPDATE jobs SET status = ? WHERE id = ?`, [status, id]);

    // client ko notify karo
    await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [job[0].client_id, `Your job "${job[0].title}" status was updated to: ${status} by admin`]
    );

    res.json({ message: 'Status updated by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin - get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, 
        c.name AS client_name, 
        t.name AS technician_name
       FROM jobs j
       LEFT JOIN users c ON j.client_id = c.id
       LEFT JOIN users t ON j.technician_id = t.id
       ORDER BY j.created_at DESC`
    );
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Technician - get assigned jobs
export const getMyJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, c.name AS client_name
       FROM jobs j
       LEFT JOIN users c ON j.client_id = c.id
       WHERE j.technician_id = ?
       ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Client - get own jobs
export const getClientJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, t.name AS technician_name
       FROM jobs j
       LEFT JOIN users t ON j.technician_id = t.id
       WHERE j.client_id = ?
       ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin - assign technician
export const assignTechnician = async (req, res) => {
  const { id } = req.params;
  const { technician_id } = req.body;

  try {
    const [job] = await pool.query(`SELECT * FROM jobs WHERE id = ?`, [id]);
    if (job.length === 0) return res.status(404).json({ message: 'Job not found' });

    await pool.query(
      `UPDATE jobs SET technician_id = ?, status = 'assigned' WHERE id = ?`,
      [technician_id, id]
    );

    // notify technician
    await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [technician_id, `You have been assigned to job: "${job[0].title}"`]
    );

    res.json({ message: 'Technician assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Technician - update status
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const [job] = await pool.query(`SELECT * FROM jobs WHERE id = ?`, [id]);
    if (job.length === 0) return res.status(404).json({ message: 'Job not found' });

    if (job[0].technician_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not assigned to this job' });
    }

    await pool.query(`UPDATE jobs SET status = ? WHERE id = ?`, [status, id]);

    // notify client about status change
    await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [job[0].client_id, `Your job "${job[0].title}" status changed to: ${status}`]
    );

    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add note to job
export const addNote = async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note) return res.status(400).json({ message: 'Message cannot be empty' });

  try {
    await pool.query(
      `INSERT INTO job_notes (job_id, user_id, note) VALUES (?, ?, ?)`,
      [id, req.user.id, note]
    );

    // job fetch karo taake client aur technician ID mile
    const [job] = await pool.query(`SELECT * FROM jobs WHERE id = ?`, [id]);
    if (job.length > 0) {
      const j = job[0];

      // agar technician ne message kiya tou client ko notify karo
      if (req.user.role === 'technician' && j.client_id) {
        await pool.query(
          `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
          [j.client_id, `New message from technician on your job: "${j.title}"`]
        );
      }

      // agar client ne message kiya tou technician ko notify karo
      if (req.user.role === 'client' && j.technician_id) {
        await pool.query(
          `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
          [j.technician_id, `New message from client on job: "${j.title}"`]
        );
      }
    }

    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get notes for a job
export const getNotes = async (req, res) => {
  const { id } = req.params;
  try {
    const [notes] = await pool.query(
      `SELECT n.*, u.name AS added_by
       FROM job_notes n
       LEFT JOIN users u ON n.user_id = u.id
       WHERE n.job_id = ?
       ORDER BY n.created_at ASC`,
      [id]
    );
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};