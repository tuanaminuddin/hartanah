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
      ['sales_package_name', 'VARCHAR(255) NULL AFTER notes'],
      ['sales_package_type', 'VARCHAR(150) NULL AFTER sales_package_name'],
      ['sales_package_data', 'LONGBLOB NULL AFTER sales_package_type'],
      ['sales_package_calculator', 'LONGTEXT NULL AFTER sales_package_data'],
      ['is_kiv', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER sales_package_calculator'],
    ];

    for (const [name, definition] of requiredColumns) {
      if (!existingColumns.has(name)) {
        await connection.query(`ALTER TABLE properties ADD COLUMN ${name} ${definition}`);
      }
    }

    if (!statusColumn?.COLUMN_TYPE.includes("'D'") || statusColumn?.COLUMN_TYPE.includes("'KIV'")) {
      await connection.query(`
        ALTER TABLE properties
        MODIFY COLUMN status ENUM('Available', 'Booked', 'Sold', 'D') NOT NULL DEFAULT 'Available'
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
