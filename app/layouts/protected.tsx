import { Outlet } from "react-router";
import { Navigation } from "~/components/ui/Navigation";
import * as AuthService from "~/services/auth.server";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  // Require authentication for all routes using this layout
  const user = await AuthService.requireAuth(request);

  // No need for manual conversion now that getAuthenticatedUser uses lean()
  return { user };
}

export default function ProtectedLayout() {
  return (
    <>
      <div className="pb-16">
        <Outlet />
      </div>
      <Navigation />
    </>
  );
}
