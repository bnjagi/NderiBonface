// Database and server setup for portfolio website
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        tags TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create contact_submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database tables initialized successfully');
    
    // Check if we have any projects, if not add some sample ones
    const projectCount = await pool.query('SELECT COUNT(*) FROM projects');
    
    if (parseInt(projectCount.rows[0].count) === 0) {
      // Insert sample projects
      await pool.query(`
        INSERT INTO projects (title, description, image_url, category, tags) VALUES
        ('Cosmic Design System', 'A comprehensive design system for space-themed applications.', 'assets/Marsbg.jpg', 'design', ARRAY['UI/UX Design', 'Design Systems']),
        ('Automotive Excellence', 'Premium car showcase website with interactive features.', 'assets/Car bg.jpg', 'development', ARRAY['Web Development', '3D Integration']),
        ('Illuminate Outdoors', 'Brand identity for a premium outdoor lighting company.', 'assets/lamp bg.jpg', 'design', ARRAY['Branding', 'Identity Design']),
        ('E-commerce Platform', 'Complete UI overhaul for an established e-commerce platform.', 'assets/desktopimg.jpg', 'development', ARRAY['UI/UX Design', 'Web Development']),
        ('Network Security System', 'Advanced security implementation for corporate network.', 'assets/rainbow colors.jpg', 'cybersecurity', ARRAY['Cybersecurity', 'Network Protection']),
        ('Data Protection Suite', 'Comprehensive data protection solution for businesses.', 'assets/Marsbg.jpg', 'cybersecurity', ARRAY['Cybersecurity', 'Data Encryption'])
      `);
      
      console.log('Sample projects added to database');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Initialize the database on startup
initializeDatabase();

// API Endpoints
// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get projects by category
app.get('/api/projects/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await pool.query(
      'SELECT * FROM projects WHERE category = $1 ORDER BY created_at DESC',
      [category]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects by category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Insert into database
    await pool.query(
      'INSERT INTO contact_submissions (name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [name, email, subject, message]
    );
    
    res.status(201).json({ success: true, message: 'Your message has been submitted successfully!' });
  } catch (err) {
    console.error('Error submitting contact form:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve the main page for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database connected`);
});