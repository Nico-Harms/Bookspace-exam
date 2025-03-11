import { Outlet, useLocation } from "react-router";
import { Navigation } from "~/components/ui/Navigation";
import { Header } from "~/components/ui/Header";
import * as AuthService from "~/services/auth.server";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  // Require authentication for all routes using this layout
  const user = await AuthService.requireAuth(request);

  // No need for manual conversion now that getAuthenticatedUser uses lean()
  return { user };
}

export default function ProtectedLayout() {
  const location = useLocation();

  // Determine if a page should show a title in the header
  const getPageTitle = (path: string) => {
    switch (true) {
      case path === "/":
        return "Home";
      case path.startsWith("/progress"):
        return "Reading Progress";
      case path.startsWith("/bookmarks"):
        return "Bookmarks";
      case path.startsWith("/profile"):
        return "Profile";
      case path.startsWith("/books/"):
        return ""; // No title on book details pages
      default:
        return "";
    }
  };

  // Determine if we should show the back button
  const shouldShowBackButton = (path: string) => {
    // Show back button on detail pages
    return path.startsWith("/books/") || path.includes("/progress/");
  };

  return (
    <>
      <Header
        title={getPageTitle(location.pathname)}
        showBackButton={shouldShowBackButton(location.pathname)}
        showAvatar={!location.pathname.startsWith("/profile")} // Don't show avatar on profile page
      />
      <div className="pb-16 pt-2">
        <Outlet />
      </div>
      <Navigation />
    </>
  );
}
