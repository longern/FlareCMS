import { useRouteLoaderData } from "react-router-dom";

export interface BlogOptions {
  blogName?: string;
  blogPublished?: string;
  blogDescription?: string;
}

export function useBlogOptions() {
  const loaderData = useRouteLoaderData("root") as BlogOptions;
  return loaderData;
}
