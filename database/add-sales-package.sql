USE hartanah;

ALTER TABLE properties
  ADD COLUMN sales_package_name VARCHAR(255) NULL AFTER notes,
  ADD COLUMN sales_package_type VARCHAR(150) NULL AFTER sales_package_name,
  ADD COLUMN sales_package_data LONGBLOB NULL AFTER sales_package_type;
