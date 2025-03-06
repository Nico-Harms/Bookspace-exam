import { redirect, type ActionFunctionArgs } from "react-router";
import { logout } from "~/services/auth.server";

export const action = async () => {
  const headers = new Headers();
  headers.set("Set-Cookie", await logout());
  return redirect("/login", { headers });
};

// This component will never render because we always redirect
export default function Logout() {
  return <p>Logging out...</p>;
}
