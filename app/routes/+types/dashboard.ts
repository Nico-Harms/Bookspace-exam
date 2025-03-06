import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { UserType } from "../../models/User";

export namespace Route {
  export type LoaderFunction = (args: LoaderFunctionArgs) => Promise<any>;
  export type ActionFunction = (args: ActionFunctionArgs) => Promise<any>;

  export interface LoaderData {
    user: UserType;
  }
}
