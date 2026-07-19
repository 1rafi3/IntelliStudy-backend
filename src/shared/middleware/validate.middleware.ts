import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      
      // Update request with parsed values (for type safety and coercion)
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      req.cookies = parsed.cookies;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
