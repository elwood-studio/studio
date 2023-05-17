import joi from 'joi';

export const name = joi
  .string()
  .min(2)
  .max(100)
  .pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/);

export const env = joi
  .object()
  .unknown(true)
  .pattern(
    joi
      .string()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z][a-zA-Z0-9-_]*$/),
    [joi.string(), joi.boolean(), joi.number()],
  );

export const timeout = joi.object({
  minutes: joi.number().required().greater(0),
});

export const access = joi
  .object({
    stage: joi
      .alternatives()
      .try(joi.boolean(), joi.string(), joi.array().items(joi.string())),
    env: joi.alternatives().try(joi.boolean(), joi.string(), joi.object()),
    secrets: joi.alternatives().try(joi.boolean(), joi.string(), joi.object()),
  })
  .unknown(false);

export const extend = joi
  .alternatives()
  .try(joi.string(), joi.array().items(joi.string()));

export const when = joi.alternatives().try(
  joi.string(),
  joi.boolean(),
  joi.array().items(joi.string()),
  joi.object({
    run: joi.string().required(),
  }),
);

export const input = joi.object({}).unknown(true);

export const matrix = joi
  .alternatives()
  .try(joi.string(), joi.array().items(joi.string()));

export const action = joi.alternatives().try(
  joi.string(),
  joi
    .object({
      action: joi.string().required(),
      args: joi.array().items(joi.string()).optional(),
      command: joi.array().items(joi.string()).optional(),
    })
    .unknown(false),
);
