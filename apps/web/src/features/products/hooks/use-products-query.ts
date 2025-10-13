import { useQuery } from "@tanstack/react-query";
import type { ProductsQuery } from "src/features/products/schemas/product.schema";
import type { ProductsResponse } from "src/features/products/types/product.response";

const BASE_URL = "https://dummyjson.com";

function buildUrl(query: ProductsQuery): string {
	const parsed = query ?? {};

	// Map your schema -> DummyJSON params
	const hasSearch = (parsed.search ?? "").trim().length > 0;
	const limit = parsed.limit;
	const page = parsed.page;
	const skip = Math.max(0, (page - 1) * limit);

	const path = parsed.category
		? `/products/category/${encodeURIComponent(parsed.category)}`
		: hasSearch
			? "/products/search"
			: "/products";

	const params = new URLSearchParams();
	if (hasSearch) {
		params.set("q", parsed.search?.trim() ?? "");
	}
	params.set("limit", String(limit));
	if (skip) {
		params.set("skip", String(skip));
	}
	if (parsed.sortBy) {
		params.set("sortBy", parsed.sortBy);
	}
	if (parsed.sortOrder) {
		params.set("order", parsed.sortOrder);
	}

	const qs = params.toString();
	return `${BASE_URL}${path}${qs ? `?${qs}` : ""}`;
}

async function fetchProducts(query: ProductsQuery): Promise<ProductsResponse> {
	const url = buildUrl(query);
	console.clear();
	console.log({ url });
	const res = await fetch(url, {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`Failed to fetch products (${res.status}): ${text || res.statusText}`,
		);
	}
	return await res.json();
}

export function useProductsQuery(query: ProductsQuery) {
	const parsed = query;
	const stableKey = {
		category: parsed.category ?? null,
		search: (parsed.search ?? "").trim() ?? null,
		page: parsed.page ?? 1,
		limit: parsed.limit ?? 12,
		sortBy: parsed.sortBy ?? null,
		sortOrder: parsed.sortOrder ?? null,
	};

	return useQuery({
		queryKey: ["products-list", stableKey],
		queryFn: () => fetchProducts(parsed),
		enabled: true,
	});
}
