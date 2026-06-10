USE hartanah;

CREATE TABLE IF NOT EXISTS property_sales_packages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  property_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(150) NOT NULL,
  data LONGBLOB NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_property_sales_packages_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

INSERT INTO property_sales_packages (property_id, name, type, data, sort_order)
SELECT p.id, p.sales_package_name, COALESCE(p.sales_package_type, 'application/octet-stream'), p.sales_package_data, 0
FROM properties p
WHERE p.sales_package_data IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM property_sales_packages sp WHERE sp.property_id = p.id
  );
