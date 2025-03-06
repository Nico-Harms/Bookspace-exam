import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
} from "react-router";
import { login, createUserSession } from "../services/auth.server";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "../components/login-form";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Simple validation
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Attempt login
  const result = await login(email, password);

  if (result.error) {
    return { error: result.error };
  }

  // Create session
  const userId = result.user?._id.toString();
  const headers = new Headers();
  if (userId) {
    headers.set("Set-Cookie", await createUserSession(userId));
  }

  return redirect("/dashboard", { headers });
};

export default function LoginPage() {
  const actionData = useActionData<{ error?: string }>();

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
