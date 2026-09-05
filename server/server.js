import 'dotenv/config';
import app from './app.js';
import { runMigrations } from './config/migrate.js';

const PORT = process.env.PORT || 5000;

// Ensure database tables exist on boot
runMigrations();

app.listen(PORT, () => {
  console.log(`Real Estate Broker Backend API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API base: http://localhost:${PORT}/api`);
});
