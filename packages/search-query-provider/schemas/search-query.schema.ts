import { z } from "zod/v4";

export const SearchStringSchema: z.ZodDefault<z.ZodString> = z.string().trim().default("");
export type ISortOrder = "asc" | "desc";

const PageQuerySchema: z.ZodDefault<z.ZodCoercedNumber<number | string>> = z.coerce
  .number<number | string>()
  .int()
  .positive()
  .min(1)
  .default(1);

export const LimitQuerySchema: z.ZodCoercedNumber<number | string> = z.coerce
  .number<number | string>()
  .int()
  .positive();

type Options = {
  defaultSortOrder?: ISortOrder;
  maxLimit?: number;
  minLimit?: number;
  defaultLimit?: number;
  defaultSortBy?: string;
};

export type BaseSearchQuerySchema = z.ZodObject<{
  page: typeof PageQuerySchema;
  limit: z.ZodDefault<typeof LimitQuerySchema>;
  search: typeof SearchStringSchema;
  sortBy: z.ZodDefault<z.ZodString>;
  sortOrder: z.ZodDefault<z.ZodLiteral<ISortOrder>>;
}>;

export function createBaseSearchQuerySchema(options?: Options): BaseSearchQuerySchema {
  return z.object({
    page: PageQuerySchema,
    limit: LimitQuerySchema.min(options?.minLimit ?? 1)
      // biome-ignore lint/style/noMagicNumbers: <let's use 100>
      .max(options?.maxLimit ?? 100)
      // biome-ignore lint/style/noMagicNumbers: <let's use 12>
      .default(options?.defaultLimit ?? 12),
    search: SearchStringSchema,
    sortBy: z
      .string()
      .trim()
      .default(options?.defaultSortBy ?? ""),
    sortOrder: z.literal<ISortOrder[]>(["asc", "desc"]).default(options?.defaultSortOrder ?? "desc"),
  });
}
