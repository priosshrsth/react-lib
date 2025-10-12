import { SearchQueryProvider } from "@react-lib/search-query-provider/contexts";
import { ProductsList } from "src/features/products/components/products-list";
import { ProductsQuerySchema } from "src/features/products/schemas/product.schema";

export default async function DataTablePage(props: {
	searchParams: Promise<Record<string, unknown>>;
}) {
	const searchParams = await props.searchParams;
	return (
		<SearchQueryProvider
			initialSearchParams={searchParams}
			schema={ProductsQuerySchema}
		>
			<ProductsList />
		</SearchQueryProvider>
	);
}
