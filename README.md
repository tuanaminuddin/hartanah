# HartanahPro

React/Vite property CRM with an Express API and MySQL database.

## MySQL setup

1. Install and start MySQL. The schema supports your current MySQL 5.5 server,
   though upgrading to MySQL 8 is recommended because MySQL 5.5 is no longer supported.
2. Run the schema:

   ```powershell
   mysql -u root -p < database/schema.sql
   ```

   For an existing HartanahPro database, add Sales Package file storage once:

   ```powershell
   mysql -u root -p hartanah < database/add-sales-package.sql
   ```

   Project image storage is created automatically at API startup. It can also
   be added manually:

   ```powershell
   mysql -u root -p hartanah < database/add-project-images.sql
   ```

   Multiple sales-package storage is also created automatically and migrates
   existing single-file packages. It can be added manually:

   ```powershell
   mysql -u root -p hartanah < database/add-property-sales-packages.sql
   ```

3. Create the local environment file and update its database password:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Start the API and Vite app together:

   ```powershell
   npm run dev
   ```

The web app runs at `http://localhost:5173` and proxies `/api` requests to
`http://localhost:3001`.

## Access

- Admin: `admin` / `admin123`

Visitors open the dashboard directly and have read-only access to the public
pages. Use the small lock in the sidebar footer or press `Ctrl+Shift+A` to
sign in; the admin account can create properties and use the settings page.

## Troubleshooting

Confirm that MySQL is running and the API can connect:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

If the response says the database is unavailable, start your MySQL service. If
you have not configured the project yet, copy `.env.example` to `.env`, enter
your MySQL password, and run `database/schema.sql`.
