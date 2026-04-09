import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';

export const getClients = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, email FROM users WHERE role = 'client'`
  );
  res.json(rows);
};

export const getTechnicians = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, email FROM users WHERE role = 'technician'`
  );
  res.json(rows);
};

// Admin - sab users dekhega
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin - user update karske
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;

  try {
    const [existing] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'User not found' });

    // agar password change karna ho
    if (password && password.trim() !== '') {
      const hash = await bcrypt.hash(password, 12);
      await pool.query(
        `UPDATE users SET name = ?, email = ?, role = ?, password_hash = ? WHERE id = ?`,
        [name, email, role, hash, id]
      );
    } else {
      await pool.query(
        `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`,
        [name, email, role, id]
      );
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin - user delete kare
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const [existing] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'User not found' });

    // pehle linked data delete hoga related user ka
    await pool.query(`DELETE FROM notifications WHERE user_id = ?`, [id]);
    await pool.query(`DELETE FROM job_notes WHERE user_id = ?`, [id]);

    // agar technician hoga toh uski jobs unassign hongi
    await pool.query(
      `UPDATE jobs SET technician_id = NULL, status = 'pending' WHERE technician_id = ?`,
      [id]
    );

    // agar client hai toh uski jobs ki notes aur notifications delete honge
    const [clientJobs] = await pool.query(`SELECT id FROM jobs WHERE client_id = ?`, [id]);
    for (const job of clientJobs) {
      await pool.query(`DELETE FROM job_notes WHERE job_id = ?`, [job.id]);
      await pool.query(`DELETE FROM notifications WHERE user_id = ?`, [id]);
    }

    // ab client ki jobs delete hongi
    await pool.query(`DELETE FROM jobs WHERE client_id = ?`, [id]);

    // than  user delete hoga finally 
    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};