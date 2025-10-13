import type { ProductSchema } from "src/features/products/schemas/product.schema";
import type { output } from "zod";

export type ProductsResponse = {
	products: output<typeof ProductSchema>[];
	total: number;
	skip: number;
	limit: number;
};
