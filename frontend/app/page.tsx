import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white md:grid-cols-2 md:min-h-[680px]">
        <LoginPanel />
        <RegisterPanel />
      </div>
    </main>
  );
}

function BrandMark({ tone = "light" }: { tone?: "light" | "dark" }) {
  const isDark = tone === "dark";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid h-8 w-8 place-items-center rounded-lg ${
          isDark ? "bg-gold-400 text-ink-900" : "bg-ink-900 text-gold-300"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      </div>
      <span
        className={`text-base font-semibold tracking-tight ${
          isDark ? "text-zinc-50" : "text-ink-900"
        }`}
      >
        FinFlow
      </span>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
  tone = "light",
  trailing,
}: {
  htmlFor: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <label
        htmlFor={htmlFor}
        className={`text-xs font-medium ${
          tone === "dark" ? "text-zinc-300" : "text-zinc-700"
        }`}
      >
        {children}
      </label>
      {trailing}
    </div>
  );
}

function LoginPanel() {
  const inputCls =
    "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-ink-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5";

  return (
    <section className="flex flex-col justify-between gap-12 p-10 sm:p-12">
      <BrandMark tone="light" />

      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink-900">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-zinc-500">
            Acesse sua conta para gerenciar seu patrimônio.
          </p>
        </header>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel
              htmlFor="login-password"
              trailing={
                <Link
                  href="#"
                  className="text-xs font-medium text-zinc-500 transition-colors hover:text-ink-900"
                >
                  Esqueceu a senha?
                </Link>
              }
            >
              Senha
            </FieldLabel>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/15"
          >
            Entrar
          </Link>

          <div className="my-1 flex items-center gap-3 text-xs text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" />
            ou
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            Continuar com Google
          </button>
        </form>
      </div>

      <p className="text-xs text-zinc-400">
        © 2026 FinFlow · Plataforma de gestão patrimonial Open Finance
      </p>
    </section>
  );
}

function RegisterPanel() {
  const inputCls =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-4 focus:ring-gold-400/10";

  return (
    <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-ink-900 p-10 text-zinc-100 sm:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(212,165,116,0.55), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(212,165,116,0.5), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-2">
        <BrandMark tone="dark" />
      </div>

      <div className="relative flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-gold-300 ring-1 ring-inset ring-gold-400/20">
            Novo aqui
          </span>
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-zinc-50">
            Crie sua conta
          </h2>
          <p className="text-sm text-zinc-400">
            Comece a gerenciar seu patrimônio em minutos. Sem cartão de crédito.
          </p>
        </header>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="register-name" tone="dark">
              Nome completo
            </FieldLabel>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="register-email" tone="dark">
              Email
            </FieldLabel>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="register-password" tone="dark">
              Senha
            </FieldLabel>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className={inputCls}
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-400">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-700 bg-zinc-900 text-gold-400 accent-gold-400 focus:ring-gold-400/30"
            />
            <span>
              Concordo com os{" "}
              <a href="#" className="text-gold-300 hover:underline">
                Termos de Uso
              </a>{" "}
              e a{" "}
              <a href="#" className="text-gold-300 hover:underline">
                Política de Privacidade
              </a>
              .
            </span>
          </label>

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-gold-300 focus:outline-none focus:ring-4 focus:ring-gold-400/30"
          >
            Criar conta
          </button>
        </form>
      </div>

      <ul className="relative flex flex-col gap-2 border-t border-zinc-800/80 pt-6 text-xs text-zinc-500">
        <FeatureItem>Open Finance integrado · 200+ instituições</FeatureItem>
        <FeatureItem>Análise de portfólio em tempo real</FeatureItem>
        <FeatureItem>Insights de IA com nível de confiança</FeatureItem>
      </ul>
    </section>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5 text-gold-400"
        aria-hidden
      >
        <path
          d="M4 10.5l3.5 3.5L16 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </li>
  );
}
