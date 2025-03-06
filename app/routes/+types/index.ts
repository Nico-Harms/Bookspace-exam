import type { LoaderFunctionArgs, MetaFunction } from "react-router";

export type LoaderArgs = LoaderFunctionArgs;
export type MetaArgs = Parameters<MetaFunction>[0];

export type ComponentProps<LoaderData = unknown> = {
  loaderData: LoaderData;
};
