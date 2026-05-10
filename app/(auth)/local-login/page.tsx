import LocalLoginForm from "@/components/forms/local-login-form";
import Link from "next/link";

export default function LocalLoginPage() {
  return (
    <div className="w-full max-w-md">
      <LocalLoginForm />
      <p className="mt-4 text-center text-sm text-[#4d4d4d]">
        Prefer OAuth? {" "}
        <Link href="/sign-in" className="text-[#0072f5] underline-offset-4 hover:underline">
          Use the OAuth sign in
        </Link>
      </p>
    </div>
  );
}