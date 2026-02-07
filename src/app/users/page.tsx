import { redirect } from "next/navigation";

export default function UsersPage() {
    // Redirect to /staff for backward compatibility
    redirect("/staff");
}
