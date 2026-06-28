import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import pool, { ensurePropertyStorage } from './db.js';

const app = express();
const port = Number(process.env.API_PORT || 3001);
const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';
const propertyStatuses = ['Available', 'Not Available'];

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '110mb' }));

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSalesPackageViewer({ id, name, type }) {
  const fileUrl = `/api/property-sales-packages/${encodeURIComponent(id)}`;
  const downloadUrl = `${fileUrl}?download=1`;
  const safeName = escapeHtml(name || 'Sales package');
  const safeType = escapeHtml(type || 'File');
  const canEmbed = type?.startsWith('image/') || type === 'application/pdf' || type?.startsWith('text/');
  const preview = canEmbed
    ? `<iframe class="preview" src="${fileUrl}" title="${safeName}"></iframe>`
    : `<section class="empty"><h2>Preview is not available for this file type.</h2><p>You can keep this tab open or download the file when you are ready.</p></section>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeName}</title>
  <style>
    body { margin: 0; background: #f8fafc; color: #0f172a; font-family: Arial, sans-serif; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 24px; border-bottom: 1px solid #e2e8f0; background: #fff; }
    h1 { margin: 0; font-size: 18px; line-height: 1.3; }
    p { margin: 4px 0 0; color: #64748b; }
    a { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; color: #0f172a; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; }
    a:hover { border-color: #10b981; color: #047857; }
    .preview { display: block; width: 100%; height: calc(100vh - 82px); border: 0; background: #fff; }
    .empty { display: grid; min-height: calc(100vh - 82px); place-content: center; padding: 24px; text-align: center; }
    .empty h2 { margin: 0; font-size: 22px; }
    @media (max-width: 640px) {
      header { align-items: flex-start; flex-direction: column; }
      a { width: calc(100% - 30px); text-align: center; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>${safeName}</h1>
      <p>${safeType}</p>
    </div>
    <a href="${downloadUrl}">Download</a>
  </header>
  ${preview}
</body>
</html>`;
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  let tokenUser;

  try {
    tokenUser = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Please sign in again.' });
  }

  pool.execute('SELECT id, role FROM users WHERE id = ? LIMIT 1', [tokenUser.id])
    .then(([users]) => {
      const user = users[0];
      if (!user) {
        return res.status(401).json({ message: 'This account no longer has portal access.' });
      }

      req.user = { ...tokenUser, id: user.id, role: user.role };
      next();
    })
    .catch(next);
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access is required.' });
  }
  next();
}

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/login', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [users] = await pool.execute(
      'SELECT id, username, password_hash, name, role, title, avatar FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
    delete user.password_hash;
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

app.get('/api/users', authenticate, adminOnly, async (_req, res, next) => {
  try {
    const [users] = await pool.query(`
      SELECT id, username, role, created_at AS createdAt
      FROM users
      ORDER BY role, username
    `);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', authenticate, adminOnly, async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = String(req.body.role || 'agent').trim().toLowerCase();

    if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
      return res.status(400).json({
        message: 'Username must be 3-50 characters using letters, numbers, dots, dashes, or underscores.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    if (!['admin', 'agent'].includes(role)) {
      return res.status(400).json({ message: 'Select a valid user role.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const title = role === 'admin' ? 'System Administrator' : 'Sales Agent';
    const [result] = await pool.execute(
      `INSERT INTO users (username, password_hash, name, role, title)
       VALUES (?, ?, ?, ?, ?)`,
      [username, passwordHash, username, role, title]
    );

    res.status(201).json({ id: result.insertId, message: 'User account created.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That username is already in use.' });
    }
    next(error);
  }
});

app.delete('/api/users/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ message: 'Invalid user account.' });
    }

    if (userId === Number(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own active account.' });
    }

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    res.json({ message: 'User account deleted.' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/properties', async (_req, res, next) => {
  try {
    let isAdminRequest = false;
    const token = _req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (token) {
      try {
        const user = jwt.verify(token, jwtSecret);
        isAdminRequest = user.role === 'admin';
      } catch {
        isAdminRequest = false;
      }
    }

    const [properties] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.location,
        p.price,
        p.status,
        p.is_kiv AS isKiv,
        COALESCE(a.name, p.agent_name) AS agent,
        p.image,
        p.notes,
        p.remarks,
        p.sales_package_calculator AS salesPackageCalculator,
        DATE_FORMAT(COALESCE(p.updated_at, p.created_at), '%d %b %Y') AS updated
      FROM properties p
      LEFT JOIN agents a ON a.id = p.agent_id
      WHERE p.status <> 'D'
        ${isAdminRequest ? '' : 'AND p.is_kiv = 0'}
      ORDER BY COALESCE(p.updated_at, p.created_at) DESC
    `);
    const [projectImages] = await pool.query(`
      SELECT id, property_id AS propertyId, name
      FROM property_images
      ORDER BY property_id, sort_order, id
    `);
    const [salesPackages] = await pool.query(`
      SELECT id, property_id AS propertyId, name
      FROM property_sales_packages
      ORDER BY property_id, sort_order, id
    `);
    const imagesByProperty = projectImages.reduce((images, projectImage) => {
      const propertyImages = images.get(projectImage.propertyId) || [];
      propertyImages.push({
        id: projectImage.id,
        name: projectImage.name,
        url: `/api/property-images/${projectImage.id}`,
      });
      images.set(projectImage.propertyId, propertyImages);
      return images;
    }, new Map());
    const salesPackagesByProperty = salesPackages.reduce((packages, salesPackage) => {
      const propertyPackages = packages.get(salesPackage.propertyId) || [];
      propertyPackages.push({
        id: salesPackage.id,
        name: salesPackage.name,
        url: `/api/property-sales-packages/${salesPackage.id}/view`,
      });
      packages.set(salesPackage.propertyId, propertyPackages);
      return packages;
    }, new Map());

    res.json(properties.map((property) => ({
      ...property,
      projectImages: imagesByProperty.get(property.id) || [],
      salesPackages: salesPackagesByProperty.get(property.id) || [],
    })));
  } catch (error) {
    next(error);
  }
});

app.post('/api/properties', authenticate, adminOnly, async (req, res, next) => {
  try {
    const {
      name,
      location,
      price,
      status,
      agent,
      image,
      notes,
      remarks,
      salesPackage,
      salesPackages = [],
      projectImages = [],
      salesPackageCalculator = null,
    } = req.body;
    const numericPrice = Number(price);
    const requestedSalesPackages = salesPackages.length ? salesPackages : salesPackage ? [salesPackage] : [];
    const decodedSalesPackages = requestedSalesPackages.map((item) => ({
      name: item.name,
      type: item.type || 'application/octet-stream',
      data: item.data ? Buffer.from(item.data, 'base64') : null,
    }));
    const decodedProjectImages = projectImages.map((projectImage) => ({
      name: projectImage.name,
      type: projectImage.type,
      data: projectImage.data ? Buffer.from(projectImage.data, 'base64') : null,
    }));

    if (!name || !location || !agent || !Number.isFinite(numericPrice) || !propertyStatuses.includes(status)) {
      return res.status(400).json({ message: 'Name, location, numeric price, agent, and valid status are required.' });
    }

    if (decodedSalesPackages.length > 10) {
      return res.status(400).json({ message: 'Upload no more than 10 sales package files.' });
    }

    const totalSalesPackageSize = decodedSalesPackages.reduce((total, item) => total + (item.data?.length || 0), 0);
    if (
      decodedSalesPackages.some((item) => !item.data || !item.name || item.data.length > 20 * 1024 * 1024)
      || totalSalesPackageSize > 50 * 1024 * 1024
    ) {
      return res.status(400).json({ message: 'Sales package files require names, must be 20 MB or smaller each and 50 MB combined.' });
    }

    if (decodedProjectImages.length > 10) {
      return res.status(400).json({ message: 'Upload no more than 10 project images.' });
    }

    const totalImageSize = decodedProjectImages.reduce((total, projectImage) => total + (projectImage.data?.length || 0), 0);
    if (
      decodedProjectImages.some((projectImage) => !projectImage.data || !projectImage.type?.startsWith('image/') || projectImage.data.length > 5 * 1024 * 1024)
      || totalImageSize > 20 * 1024 * 1024
    ) {
      return res.status(400).json({ message: 'Project images must be image files, no larger than 5 MB each and 20 MB combined.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO properties (
          name, location, price, status, agent_name, image, notes, remarks,
          sales_package_name, sales_package_type, sales_package_data, sales_package_calculator
        )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          location,
          numericPrice,
          status,
          agent,
          image || null,
          notes || null,
          remarks || null,
          null,
          null,
          null,
          salesPackageCalculator ? JSON.stringify(salesPackageCalculator) : null,
        ]
      );

      for (const [index, projectImage] of decodedProjectImages.entries()) {
        await connection.execute(
          `INSERT INTO property_images (property_id, name, type, data, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [result.insertId, projectImage.name || `project-image-${index + 1}`, projectImage.type, projectImage.data, index]
        );
      }

      for (const [index, item] of decodedSalesPackages.entries()) {
        await connection.execute(
          `INSERT INTO property_sales_packages (property_id, name, type, data, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [result.insertId, item.name, item.type, item.data, index]
        );
      }

      await connection.commit();
      res.status(201).json({ id: result.insertId, message: 'Property created.' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
});

app.patch('/api/properties/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const {
      name,
      location,
      price,
      status,
      agent,
      image,
      notes,
      remarks,
      salesPackages = [],
      projectImages = [],
      salesPackageCalculator = null,
      replaceSalesPackages = false,
      replaceProjectImages = false,
    } = req.body;
    const numericPrice = Number(price);
    const decodedSalesPackages = salesPackages.map((item) => ({
      name: item.name,
      type: item.type || 'application/octet-stream',
      data: item.data ? Buffer.from(item.data, 'base64') : null,
    }));
    const decodedProjectImages = projectImages.map((projectImage) => ({
      name: projectImage.name,
      type: projectImage.type,
      data: projectImage.data ? Buffer.from(projectImage.data, 'base64') : null,
    }));

    if (!name || !location || !agent || !Number.isFinite(numericPrice) || !propertyStatuses.includes(status)) {
      return res.status(400).json({ message: 'Name, location, numeric price, developer, and valid status are required.' });
    }

    if (decodedSalesPackages.length > 10) {
      return res.status(400).json({ message: 'Upload no more than 10 sales package files.' });
    }

    const totalSalesPackageSize = decodedSalesPackages.reduce((total, item) => total + (item.data?.length || 0), 0);
    if (
      decodedSalesPackages.some((item) => !item.data || !item.name || item.data.length > 20 * 1024 * 1024)
      || totalSalesPackageSize > 50 * 1024 * 1024
    ) {
      return res.status(400).json({ message: 'Sales package files require names, must be 20 MB or smaller each and 50 MB combined.' });
    }

    if (decodedProjectImages.length > 10) {
      return res.status(400).json({ message: 'Upload no more than 10 project images.' });
    }

    const totalImageSize = decodedProjectImages.reduce((total, projectImage) => total + (projectImage.data?.length || 0), 0);
    if (
      decodedProjectImages.some((projectImage) => !projectImage.data || !projectImage.type?.startsWith('image/') || projectImage.data.length > 5 * 1024 * 1024)
      || totalImageSize > 20 * 1024 * 1024
    ) {
      return res.status(400).json({ message: 'Project images must be image files, no larger than 5 MB each and 20 MB combined.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `UPDATE properties
         SET
          name = ?,
          location = ?,
          price = ?,
          status = ?,
          agent_name = ?,
          agent_id = NULL,
          image = ?,
          notes = ?,
          remarks = ?,
          sales_package_calculator = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND status <> 'D'`,
        [
          name,
          location,
          numericPrice,
          status,
          agent,
          image || null,
          notes || null,
          remarks || null,
          salesPackageCalculator ? JSON.stringify(salesPackageCalculator) : null,
          req.params.id,
        ]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Active property not found.' });
      }

      if (replaceProjectImages) {
        await connection.execute('DELETE FROM property_images WHERE property_id = ?', [req.params.id]);
        for (const [index, projectImage] of decodedProjectImages.entries()) {
          await connection.execute(
            `INSERT INTO property_images (property_id, name, type, data, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [req.params.id, projectImage.name || `project-image-${index + 1}`, projectImage.type, projectImage.data, index]
          );
        }
      }

      let savedSalesPackageCount = 0;
      if (replaceSalesPackages) {
        await connection.execute('DELETE FROM property_sales_packages WHERE property_id = ?', [req.params.id]);
        for (const [index, item] of decodedSalesPackages.entries()) {
          await connection.execute(
            `INSERT INTO property_sales_packages (property_id, name, type, data, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [req.params.id, item.name, item.type, item.data, index]
          );
        }
        const [salesPackageRows] = await connection.execute(
          'SELECT COUNT(*) AS count FROM property_sales_packages WHERE property_id = ?',
          [req.params.id]
        );
        savedSalesPackageCount = Number(salesPackageRows[0]?.count || 0);
      }

      await connection.commit();
      res.json({
        message: 'Property updated.',
        salesPackageCount: savedSalesPackageCount,
        replacedSalesPackages: Boolean(replaceSalesPackages),
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
});

app.patch('/api/properties/:id/kiv', authenticate, adminOnly, async (req, res, next) => {
  try {
    const isKiv = Boolean(req.body.isKiv);
    const [result] = await pool.execute(
      `UPDATE properties
       SET is_kiv = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status <> 'D'`,
      [isKiv ? 1 : 0, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Active property not found.' });
    }

    res.json({ message: isKiv ? 'Property marked as KIV.' : 'Property restored from KIV.' });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/properties/:id/status', authenticate, adminOnly, async (req, res, next) => {
  try {
    if (req.body.status !== 'D') {
      return res.status(400).json({ message: 'Only soft-delete status D is supported.' });
    }

    const [result] = await pool.execute(
      `UPDATE properties
       SET status = 'D', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status <> 'D'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Active property not found.' });
    }

    res.json({ message: 'Property deleted from active listings.' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/properties/:id/sales-package', async (req, res, next) => {
  try {
    const [packages] = await pool.execute(
      `SELECT sp.name, sp.type, sp.data
       FROM property_sales_packages sp
       INNER JOIN properties p ON p.id = sp.property_id
       WHERE sp.property_id = ? AND p.status <> 'D'
       ORDER BY sp.sort_order, sp.id
       LIMIT 1`,
      [req.params.id]
    );
    const salesPackage = packages[0];

    if (!salesPackage?.data) {
      return res.status(404).json({ message: 'Sales package not found.' });
    }

    const safeName = String(salesPackage.name || 'sales-package').replace(/[\r\n"]/g, '_');
    res.setHeader('Content-Type', salesPackage.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.send(salesPackage.data);
  } catch (error) {
    next(error);
  }
});

app.get('/api/property-sales-packages/:id/view', async (req, res, next) => {
  try {
    const [packages] = await pool.execute(
      `SELECT sp.name, sp.type
       FROM property_sales_packages sp
       INNER JOIN properties p ON p.id = sp.property_id
       WHERE sp.id = ? AND p.status <> 'D'
       LIMIT 1`,
      [req.params.id]
    );
    const salesPackage = packages[0];

    if (!salesPackage) {
      return res.status(404).send('Sales package not found.');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderSalesPackageViewer({
      id: req.params.id,
      name: salesPackage.name,
      type: salesPackage.type,
    }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/property-sales-packages/:id', async (req, res, next) => {
  try {
    const [packages] = await pool.execute(
      `SELECT sp.name, sp.type, sp.data
       FROM property_sales_packages sp
       INNER JOIN properties p ON p.id = sp.property_id
       WHERE sp.id = ? AND p.status <> 'D'
       LIMIT 1`,
      [req.params.id]
    );
    const salesPackage = packages[0];

    if (!salesPackage?.data) {
      return res.status(404).json({ message: 'Sales package not found.' });
    }

    const safeName = String(salesPackage.name || 'sales-package').replace(/[\r\n"]/g, '_');
    res.setHeader('Content-Type', salesPackage.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `${req.query.download ? 'attachment' : 'inline'}; filename="${safeName}"`);
    res.send(salesPackage.data);
  } catch (error) {
    next(error);
  }
});

app.get('/api/property-images/:id', async (req, res, next) => {
  try {
    const [images] = await pool.execute(
      'SELECT name, type, data FROM property_images WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    const projectImage = images[0];

    if (!projectImage?.data) {
      return res.status(404).json({ message: 'Project image not found.' });
    }

    res.setHeader('Content-Type', projectImage.type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(projectImage.data);
  } catch (error) {
    next(error);
  }
});

app.get('/api/agents', async (_req, res, next) => {
  try {
    const [agents] = await pool.query(`
      SELECT a.id, a.name, a.region, a.phone, a.email, COUNT(p.id) AS listings
      FROM agents a
      LEFT JOIN properties p ON (p.agent_id = a.id OR p.agent_name = a.name) AND p.status <> 'D'
      GROUP BY a.id
      ORDER BY a.name
    `);
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

app.post('/api/agents', authenticate, adminOnly, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const region = String(req.body.region || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!name || !region || !phone || !email) {
      return res.status(400).json({ message: 'Name, region, phone, and email are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid agent email address.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO agents (name, region, phone, email) VALUES (?, ?, ?, ?)',
      [name, region, phone, email]
    );

    res.status(201).json({ id: result.insertId, message: 'Agent created.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An agent with this name or email already exists.' });
    }
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'The combined upload is too large.' });
  }

  if (error.code === 'ER_NET_PACKET_TOO_LARGE') {
    return res.status(413).json({ message: 'Sales package is too large for the database connection.' });
  }

  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      message: 'Database unavailable. Start MySQL and check the database settings in .env.',
    });
  }

  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({
      message: 'Database login failed. Check DB_USER and DB_PASSWORD in .env.',
    });
  }

  if (error.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({
      message: 'Database not found. Run database/schema.sql to create and seed it.',
    });
  }

  res.status(500).json({ message: 'The server could not complete the request.' });
});

try {
  await ensurePropertyStorage();
  app.listen(port, () => {
    console.log(`HartanahPro API running at http://localhost:${port}`);
  });
} catch (error) {
  console.error('Unable to prepare the database schema.', error);
  process.exitCode = 1;
}
