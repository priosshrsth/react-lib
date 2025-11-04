import type { IBaseSearchQuery } from "@rnt-lib/core";
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

export type ProductsQuery = Omit<IBaseSearchQuery, "sortBy"> & {
	category?: string;
	sortBy?: "price" | "rating" | "discountPercentage" | "title";
};
