import { Link, useRouteLoaderData } from "react-router";
import { Avatar } from "./avatar";
import { Button } from "./button";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showAvatar?: boolean;
}

export function Header({
  title = "",
  showBackButton = false,
  showAvatar = true,
}: HeaderProps) {
  // Get the user data from the protected layout loader
  const loaderData = useRouteLoaderData("layouts/protected") as
    | { user?: { profileImage?: string; name?: string } }
    | undefined;
  const user = loaderData?.user;

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mr-3"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
        )}
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      {showAvatar && user && (
        <Link to="/profile">
          <Avatar src={user.profileImage} name={user.name} size="sm" />
        </Link>
      )}
    </header>
  );
}
