const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

const normalizeOrigin = (url) => url.trim().replace(/\/$/, '');

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

const getAllowedOrigins = () => {
  const fromEnv = parseOrigins(process.env.FRONTEND_URL);
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return fromEnv.length > 0 ? fromEnv : DEV_ORIGINS;
  }

  return [...new Set([...DEV_ORIGINS, ...fromEnv])];
};

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Same-origin / server-to-server / curl
    if (!origin) {
      return callback(null, true);
    }

    const normalized = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    console.warn(
      `CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ') || '(none)'}`
    );
    return callback(null, false);
  },
  credentials: true,
};

module.exports = { corsOptions, getAllowedOrigins };
