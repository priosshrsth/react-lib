interface Options {
  pushToHistory?: boolean;
}

export function setSearchParams(paramsToSet: object, options?: Options): void {
  const url = new URL(window.location.href);
  const currentParams = url.searchParams;

  // Merge currentParams with paramsToSet and ensure URL-friendly formatting
  const updatedParams = Object.fromEntries(
    Object.entries({ ...currentParams, ...paramsToSet }).filter(
      // @ts-expect-error value could be string
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
  );

  // Manually build the query string
  const newQueryString = Object.entries(updatedParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  const fn = options?.pushToHistory ? window.history.pushState : window.history.replaceState;

  fn({}, "", `${url.pathname}?${newQueryString}`);
}
