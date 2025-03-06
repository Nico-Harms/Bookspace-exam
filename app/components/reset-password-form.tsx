import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Form, useActionData, useNavigation } from "react-router";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const actionData = useActionData<{ error?: string; success?: string }>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email to receive a password reset link
        </p>
      </div>

      {actionData?.error && (
        <div className="bg-red-100 p-3 rounded text-red-700 text-sm">
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-100 p-3 rounded text-green-700 text-sm">
          {actionData.success}
        </div>
      )}

      <Form method="post" className="grid gap-5">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Submitting..." : "Reset Password"}
        </Button>
      </Form>
    </div>
  );
}
