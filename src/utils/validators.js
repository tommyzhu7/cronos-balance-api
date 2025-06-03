const Joi = require('joi');

const ethereumAddress = Joi.string()
  .pattern(/^0x[a-fA-F0-9]{40}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid Ethereum address format',
    'any.required': 'Address is required',
  });

const schemas = {
  address: Joi.object({
    address: ethereumAddress,
  }),
  tokenBalance: Joi.object({
    address: ethereumAddress,
    tokenAddress: ethereumAddress,
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = {
  schemas,
  validate,
};
