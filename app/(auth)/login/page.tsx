import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-2">James-Day</h1>
        <p className="text-muted text-sm mb-8">Sign in with a magic link to access the family timeline.</p>
        <LoginForm />
      </div>
    </main>
  );
}
