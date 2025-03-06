import { redirect, data } from "react-router";
import type { Route } from "./+types/signup";
import { signup } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import { SignupForm } from "~/components/signup-form";

// We need to export a loader function to check if the user is already
// authenticated and redirect them to the dashboard
export async function loader({ request }: Route.LoaderArgs) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const authUser = session.get("authUser");
  if (authUser) {
    return redirect("/");
  }
  return data(null);
}

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          {/* {insert logo here} */}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/coverpicture.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return data({ error: "Please provide name, email and password." });
    }

    // Use the signup function from auth.server.ts
    const result = await signup(name, email, password);

    if (result.error) {
      return data({ error: result.error });
    }

    // Create a session and set the auth user
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    session.set("authUser", { _id: result.user._id });

    // Redirect to home page with session cookie
    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  } catch (error) {
    if (error instanceof Error) {
      return data({ error: error.message });
    }
    return data({ error: "An unexpected error occurred during signup." });
  }
}
