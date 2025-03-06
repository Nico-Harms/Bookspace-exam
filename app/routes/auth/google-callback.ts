import { redirect } from "react-router";
import { authenticator } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import type { LoaderFunctionArgs } from "react-router";
// to handle the callback from the provider.
// This is the route that the provider will redirect the user to after they log in.
// This route will handle the OAuth2 flow and store the user in the session.
export async function loader({ request }: LoaderFunctionArgs) {
  // The authenticator.authenticate() returns the user object
  // In this case, it returns { _id: userId }
  let authUser = await authenticator.authenticate("google", request);
  if (!authUser) {
    return redirect("/login");
  }

  // Get the session from the request
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );

  // Set the authUser in the session - this should match how we set it in signup
  session.set("authUser", authUser);

  // Redirect to the home page with the session cookie
  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}
