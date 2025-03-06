import { data, redirect } from "react-router";
import { getAuthUser } from "~/services/auth.server";
import { ResetPasswordForm } from "~/components/reset-password-form";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const user = await getAuthUser(request);
  if (user) {
    return redirect("/");
  }
  return null;
}

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start"></div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ResetPasswordForm />
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

export async function action({ request }: ActionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      return data({ error: "Please provide your email address." });
    }

    // In a real application, you would:
    // 1. Check if the email exists in your database
    // 2. Generate a reset token and store it
    // 3. Send an email with a link containing the token

    // For this demonstration, we'll just return a success message
    console.log(`Password reset requested for email: ${email}`);

    return data({
      success:
        "If an account exists with that email, we've sent password reset instructions.",
    });
  } catch (error) {
    if (error instanceof Error) {
      return data({ error: error.message });
    }
    return data({ error: "An unexpected error occurred." });
  }
}
