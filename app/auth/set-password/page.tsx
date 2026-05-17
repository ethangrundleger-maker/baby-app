import SetPasswordForm from "./SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-2">Set a new password</h1>
        <p className="text-muted text-sm mb-8">You'll use this to sign in from now on.</p>
        <SetPasswordForm />
      </div>
    </main>
  );
}
