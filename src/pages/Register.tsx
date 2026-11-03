import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/pages/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "@/lib/validation";

export default function Register() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    displayName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const set = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = {
      displayName: validateDisplayName(values.displayName) ?? undefined,
      email: validateEmail(values.email) ?? undefined,
      password: validatePassword(values.password) ?? undefined,
      confirm:
        values.confirm === values.password ? undefined : "As senhas não coincidem.",
    };
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    const { error, needsEmailConfirmation } = await signUp(
      values.email,
      values.password,
      values.displayName,
    );
    setLoading(false);

    if (error) {
      setFormError(error);
      return;
    }
    if (needsEmailConfirmation) {
      setConfirmSent(true);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  if (confirmSent) {
    return (
      <AuthShell
        title="Confirme seu e-mail"
        subtitle="Falta um passo para sua biblioteca ficar pronta."
        footer={
          <Link to="/login" className="font-medium text-moss-300 hover:text-moss-200">
            Voltar para o login
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <MailCheck className="h-8 w-8 text-moss-400" aria-hidden />
          <p className="text-sm leading-relaxed text-ink-muted">
            Enviamos um link de confirmação para{" "}
            <strong className="text-ink">{values.email}</strong>. Abra o link e
            depois entre com sua senha.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a registrar sua história como jogador."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-moss-300 hover:text-moss-200">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field
          label="Como quer ser chamado"
          htmlFor="register-name"
          error={errors.displayName}
          required
        >
          <Input
            id="register-name"
            autoComplete="nickname"
            value={values.displayName}
            onChange={(event) => set("displayName", event.target.value)}
            placeholder="Seu nome ou nick"
            maxLength={60}
            invalid={Boolean(errors.displayName)}
          />
        </Field>

        <Field label="E-mail" htmlFor="register-email" error={errors.email} required>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
            placeholder="voce@exemplo.com"
            invalid={Boolean(errors.email)}
          />
        </Field>

        <Field
          label="Senha"
          htmlFor="register-password"
          error={errors.password}
          hint="Mínimo de 8 caracteres, com letras e números."
          required
        >
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => set("password", event.target.value)}
            placeholder="••••••••"
            invalid={Boolean(errors.password)}
          />
        </Field>

        <Field
          label="Confirmar senha"
          htmlFor="register-confirm"
          error={errors.confirm}
          required
        >
          <Input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={(event) => set("confirm", event.target.value)}
            placeholder="••••••••"
            invalid={Boolean(errors.confirm)}
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
          Criar minha conta
        </Button>
      </form>
    </AuthShell>
  );
}
