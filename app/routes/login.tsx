import { data, redirect } from "react-router";
import { authenticator, getAuthUser } from "~/services/auth.server";
import type { Route } from "./+types/login";
import { sessionStorage } from "~/services/session.server";
import { LoginForm } from "~/components/login-form";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (user) {
    return redirect("/");
  }
}

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start"></div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/coverpicture.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  try {
    let authUser = await authenticator.authenticate("email-pass", request);
    if (!authUser) {
      return redirect("/signin");
    }
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    session.set("authUser", authUser);
    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    if (error instanceof Error) {
      // here the error related to the authentication process
      return data({ error: error.message });
    }
  }
}
