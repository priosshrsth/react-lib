"use client";

import {
	type ColumnDefinition,
	Pagination,
	Table,
	useSearchQuery,
} from "@rnt-lib/core";
import { useEffect } from "react";

import { useProductsQuery } from "src/features/products/hooks/use-products-query";
import type { ProductsQuery } from "src/features/products/schemas/product.schema";
import type { ProductsResponse } from "src/features/products/types/product.response";

const columns: ColumnDefinition<ProductsResponse["products"][number]>[] = [
	{
		header: "Title",
		accessor: "title",
		value: (row) => row.title,
		isSortable: true,
	},
	{
		header: "Category",
		accessor: "category",
		value: (row) => row.category,
	},
	{
		header: "Brand",
		accessor: "brand",
		value: (row) => row.brand ?? "—",
	},
	{
		header: "Price",
		accessor: "price",
		value: (row) => `$${row.price}`,
		thClassName: "text-right",
		tdClassName: "text-right",
	},
	{
		header: "Rating",
		accessor: "rating",
		value: (row) => row.rating ?? "—",
		thClassName: "text-right",
		tdClassName: "text-right",
	},
];

export function ProductsList() {
	const { searchQuery, setTotal, handleSearch } =
		useSearchQuery<ProductsQuery>();

	const productsQuery = useProductsQuery(searchQuery);

	useEffect(() => {
		if (typeof productsQuery.data?.total === "number") {
			setTotal(productsQuery.data.total);
		}
	}, [productsQuery.data?.total, setTotal]);

	return (
		<div className="flex flex-col gap-4 w-full">
			<form
				className="flex items-center gap-2"
				onSubmit={(e) => {
					e.preventDefault();
				}}
			>
				<input
					name="q"
					type="search"
					placeholder="Search products…"
					className="w-full max-w-96 rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
					onChange={handleSearch}
					defaultValue={searchQuery.search ?? ""}
				/>
			</form>

			<Table
				className={"border border-neutral-200"}
				theadClassName={"bg-gray-600 text-black"}
				cellClassName={"border-r border-neutral-200"}
				headRowClassName={"border-b-gray-200 border-b"}
				bodyRowClassName={"border-t-gray-200 border-b"}
				isLoading={productsQuery.isLoading}
				data={productsQuery.data?.products ?? []}
				columns={columns}
			/>

			<Pagination
				activePageButtonClassName={"font-bold text-green-600"}
				prevLabel="<"
				nextLabel=">"
			/>
		</div>
	);
}
