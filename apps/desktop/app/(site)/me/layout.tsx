// The study pages need no sign-in gate: the desktop app's single local user
// is always signed in.
export default function MeLayout({ children }: { children: React.ReactNode }) {
  return <div className="ed-page mx-auto w-full max-w-5xl px-4">{children}</div>
}
