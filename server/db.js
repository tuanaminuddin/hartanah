import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hartanah',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

export async function ensurePropertyStorage() {
  const connection = await pool.getConnection();

  try {
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'properties'
    `);
    const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));
    const statusColumn = columns.find((column) => column.COLUMN_NAME === 'status');
    const requiredColumns = [
      ['remarks', 'LONGTEXT NULL AFTER notes'],
      ['sales_package_name', 'VARCHAR(255) NULL AFTER notes'],
      ['sales_package_type', 'VARCHAR(150) NULL AFTER sales_package_name'],
      ['sales_package_data', 'LONGBLOB NULL AFTER sales_package_type'],
      ['sales_package_calculator', 'LONGTEXT NULL AFTER sales_package_data'],
      ['is_archived', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER sales_package_calculator'],
    ];

    if (existingColumns.has('is_kiv') && !existingColumns.has('is_archived')) {
      await connection.query(`
        ALTER TABLE properties
        CHANGE COLUMN is_kiv is_archived TINYINT(1) NOT NULL DEFAULT 0
      `);
      existingColumns.delete('is_kiv');
      existingColumns.add('is_archived');
    } else if (existingColumns.has('is_kiv') && existingColumns.has('is_archived')) {
      await connection.query('UPDATE properties SET is_archived = 1 WHERE is_kiv = 1');
      await connection.query('ALTER TABLE properties DROP COLUMN is_kiv');
      existingColumns.delete('is_kiv');
    }

    for (const [name, definition] of requiredColumns) {
      if (!existingColumns.has(name)) {
        await connection.query(`ALTER TABLE properties ADD COLUMN ${name} ${definition}`);
      }
    }

    const [indexes] = await connection.query(`
      SELECT INDEX_NAME
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'properties'
    `);
    const existingIndexes = new Set(indexes.map((index) => index.INDEX_NAME));
    if (!existingIndexes.has('idx_properties_archive_updated')) {
      await connection.query(`
        CREATE INDEX idx_properties_archive_updated
        ON properties (is_archived, status, updated_at, created_at)
      `);
    }

    if (
      !statusColumn?.COLUMN_TYPE.includes("'D'")
      || !statusColumn?.COLUMN_TYPE.includes("'Not Available'")
      || statusColumn?.COLUMN_TYPE.includes("'Booked'")
      || statusColumn?.COLUMN_TYPE.includes("'Sold'")
      || statusColumn?.COLUMN_TYPE.includes("'KIV'")
    ) {
      await connection.query(`
        ALTER TABLE properties
        MODIFY COLUMN status ENUM('Available', 'Not Available', 'Booked', 'Sold', 'KIV', 'D') NOT NULL DEFAULT 'Available'
      `);
      await connection.query(`
        UPDATE properties
        SET status = 'Not Available'
        WHERE status IN ('Booked', 'Sold', 'KIV')
      `);
      await connection.query(`
        ALTER TABLE properties
        MODIFY COLUMN status ENUM('Available', 'Not Available', 'D') NOT NULL DEFAULT 'Available'
      `);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        property_id INT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(150) NOT NULL,
        data LONGBLOB NOT NULL,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_property_images_property
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS property_sales_packages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        property_id INT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(150) NOT NULL,
        data LONGBLOB NOT NULL,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_property_sales_packages_property
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      INSERT INTO property_sales_packages (property_id, name, type, data, sort_order)
      SELECT p.id, p.sales_package_name, COALESCE(p.sales_package_type, 'application/octet-stream'), p.sales_package_data, 0
      FROM properties p
      WHERE p.sales_package_data IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM property_sales_packages sp WHERE sp.property_id = p.id
        )
    `);

    await connection.query('SET GLOBAL max_allowed_packet = 67108864');
  } finally {
    // A new connection is needed to inherit the updated global packet limit.
    connection.destroy();
  }
}

export default pool;
