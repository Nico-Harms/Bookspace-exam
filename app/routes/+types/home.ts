import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import type { BookType } from "~/models/Book";

export namespace Route {
  export type LoaderArgs = LoaderFunctionArgs;
  export type ActionArgs = ActionFunctionArgs;
  export type MetaArgs = Parameters<MetaFunction>[0];

  export interface LoaderData {
    user: {
      _id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
    books: BookType[];
    genres: string[];
    q: string;
    sortBy: string;
    filterGenre: string;
  }

  export type ComponentProps = {
    loaderData: LoaderData;
  };
}
