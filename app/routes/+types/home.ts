import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import type { UserType } from "../../models/User";
import type { Collection } from "mongoose";
import type { ComponentProps as BaseComponentProps, MetaArgs } from "./index";

export namespace Route {
  export type LoaderArgs = LoaderFunctionArgs;
  export type ActionArgs = ActionFunctionArgs;
  export type MetaArgs = Parameters<MetaFunction>[0];

  export interface LoaderData {
    user: UserType;
    dbName: string;
    collections: Collection[];
    models: string[];
  }

  export type ComponentProps = BaseComponentProps<LoaderData>;
}
