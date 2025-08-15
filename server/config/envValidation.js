const Joi = require('joi');

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(5000),
    MONGO_URI: Joi.string().required().description('Mongo DB URI'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_EXPIRE: Joi.string().default('30d').description('JWT expiration time'),
    JWT_COOKIE_EXPIRE: Joi.number().default(30).description('JWT cookie expiration in days'),
    FRONTEND_URL: Joi.string().uri().description('Frontend URL for CORS and redirects'),
    // Add other critical environment variables here
    // CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    // CLOUDINARY_API_KEY: Joi.string().required(),
    // CLOUDINARY_API_SECRET: Joi.string().required(),
  })
  .unknown(); // Allow unknown keys

module.exports = () => {
  const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  // Assign validated environment variables to process.env
  Object.assign(process.env, envVars);

  console.log('Environment variables validated successfully.');
};
