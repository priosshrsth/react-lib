import { ProductsList } from "src/features/products/components/products-list";
import {SearchQueryProvider} from "@react-lib/core/search-query/contexts/search-query.provider";


export default async function DataTablePage(props: {
	searchParams: Promise<Record<string, unknown>>;
}) {
	const searchParams = await props.searchParams;
	return (
		<div className={'p-20'}>
			<SearchQueryProvider
				syncWithUrl={true}
				initialSearchParams={searchParams}
				defaultValues={{ limit: 12, page: 1, category: "", search: "" }}
			>
				<ProductsList />
			</SearchQueryProvider>
		</div>
	);
}
