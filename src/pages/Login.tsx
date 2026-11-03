import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/pages/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { validateEmail } from "@/lib/validation";

export default function Login() {
  const { signIn, resetPassword, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = {
      email: validateEmail(email) ?? undefined,
      password: password ? undefined : "Informe sua senha.",
    };
    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setFormError(error);
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  const handleReset = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setResetting(true);
    const { error } = await resetPassword(email);
    setResetting(false);
    if (error) toast.error(error);
    else
      toast.success(
        "Se existir uma conta com este e-mail, o link de redefinição foi enviado.",
      );
  };

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua biblioteca e continue de onde parou."
      footer={
        <>
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-medium text-moss-300 hover:text-moss-200">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="E-mail" htmlFor="login-email" error={errors.email} required>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="voce@exemplo.com"
            invalid={Boolean(errors.email)}
          />
        </Field>

        <Field label="Senha" htmlFor="login-password" error={errors.password} required>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="••••••••"
            invalid={Boolean(errors.password)}
          />
        </Field>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-200"
          >
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={loading} disabled={!configured}>
          Entrar
        </Button>

        <button
          type="button"
          onClick={handleReset}
          disabled={resetting || !configured}
          className="w-full text-center text-xs text-ink-faint underline-offset-2 transition-colors hover:text-ink-muted hover:underline disabled:opacity-50"
        >
          {resetting ? "Enviando..." : "Esqueci minha senha"}
        </button>
      </form>
    </AuthShell>
  );
}
