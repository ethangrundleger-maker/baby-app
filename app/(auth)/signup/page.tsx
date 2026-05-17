import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-2">James-Day</h1>
        <p className="text-muted text-sm mb-8">Create an account with the invite code your household shared.</p>
        <SignupForm />
      </div>
    </main>
  );
}
