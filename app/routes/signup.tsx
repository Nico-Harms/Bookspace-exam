import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import {
  signup,
  createUserSession,
  getAuthenticatedUser,
} from "../services/auth.server";
import { GalleryVerticalEnd } from "lucide-react";
import { SignupForm } from "../components/signup-form";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // This will automatically redirect to login if not authenticated
  const user = await getAuthenticatedUser(request);
  if (user) {
    return redirect("/dashboard");
  }

  return { user };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // validation
  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  // Attempt signup
  const result = await signup(name, email, password);

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

export default function SignupPage() {
  const actionData = useActionData<{ error?: string }>();

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
