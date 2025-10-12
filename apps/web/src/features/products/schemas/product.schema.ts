import { createBaseSearchQuerySchema } from "@react-lib/search-query-provider/schemas";
import { z } from "zod";

export const ProductSchema = z.object({
	id: z.number().int().positive(),
	title: z.string(),
	description: z.string(),
	price: z.number(), // in USD
	discountPercentage: z.number().optional(),
	rating: z.number().optional(),
	stock: z.number().int().optional(),
	brand: z.string().optional(),
	category: z.string(),
	thumbnail: z.url().optional(),
	images: z.array(z.url()).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductsQuerySchema = createBaseSearchQuerySchema({
	defaultLimit: 12,
}).extend({
	category: z.string().trim().min(1).optional(),
	sortBy: z.enum(["price", "rating", "discountPercentage", "title"]).optional(),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
