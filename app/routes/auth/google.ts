import { authenticator } from "~/services/auth.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

//This will start the OAuth2 flow and redirect the user to the provider's login page.
//Once the user logs in and authorizes your application, the provider will redirect
//the user back to your application redirect URI.

// Handle GET requests - when user visits /auth/google directly
export async function loader({ request }: LoaderFunctionArgs) {
  return authenticator.authenticate("google", request);
}

// Handle POST requests - when form is submitted
export async function action({ request }: ActionFunctionArgs) {
  return authenticator.authenticate("google", request);
}
