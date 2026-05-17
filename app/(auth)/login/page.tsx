import LoginForm from "./LoginForm";

const ERRORS: Record<string, string> = {
  invalid_invite: "That invite code didn't match a family.",
  invite_is_placeholder: "That invite code hasn't been set up yet.",
  invalid_request: "That sign-in link has expired. Request a new one.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const msg = error ? (ERRORS[error] ?? error) : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-2">James-Day</h1>
        <p className="text-muted text-sm mb-8">Sign in to access the family timeline.</p>
        {msg && (
          <div role="alert" className="mb-4 rounded-lg border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
            {msg}
          </div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
