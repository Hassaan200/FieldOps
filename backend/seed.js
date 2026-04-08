import bcrypt from 'bcryptjs';
import pool from './db/connection.js';

const seed = async () => {
  const hash = await bcrypt.hash('admin123', 12);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES
      ('Hassan Admin', 'admin@fieldops.com', ?, 'admin'),
      ('Ali Technician', 'tech@fieldops.com', ?, 'technician'),
      ('Sara Client', 'client@fieldops.com', ?, 'client')
    `,
    [hash, hash, hash]
  );

  console.log('Users seeded successfully');
  process.exit();
};

seed();