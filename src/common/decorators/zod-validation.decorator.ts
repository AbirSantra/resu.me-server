import { UsePipes } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';

export function ZodValidate(schema: ZodSchema) {
  return UsePipes(new ZodValidationPipe(schema));
}
