require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { getAllowedOrigins } = require('./config/cors');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`CORS allowed origins: ${getAllowedOrigins().join(', ')}`);
  });
});
