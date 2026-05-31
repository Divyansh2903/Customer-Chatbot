import type { RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';

type Source = 'body' | 'params' | 'query';

export function validate<S extends ZodTypeAny>(
  schema: S,
  source: Source = 'body',
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Replace the parsed value so downstream handlers get the typed/coerced data.
    Object.assign(req[source] as object, result.data);
    next();
  };
}

export type Inferred<S extends ZodTypeAny> = z.infer<S>;
