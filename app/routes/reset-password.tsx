import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import type {
  MetaFunction,
} from '@remix-run/cloudflare';

import {
  Link,
} from '@remix-run/react';

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import {
  AuthShell,
} from '~/components/auth/AuthShell';

import {
  completeAuthRedirect,
  getCurrentUser,
  isAnonymousUser,
  logout,
  updatePassword,
} from '~/lib/auth/auth.client';

export const meta: MetaFunction = () => {
  return [
    {
      title:
        'Redefinir senha | 7System Builder',
    },
    {
      name:
        'description',

      content:
        'Defina uma nova senha para sua conta do 7System Builder.',
    },
  ];
};

type PageStatus =
  | 'loading'
  | 'ready'
  | 'success'
  | 'error';

export default function ResetPassword() {
  const [
    status,
    setStatus,
  ] =
    useState<PageStatus>(
      'loading',
    );

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('');

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  /*
   * Processa o link recebido
   * por e-mail.
   */
  useEffect(() => {
    let active = true;

    async function prepareRecovery() {
      try {
        setStatus(
          'loading',
        );

        setErrorMessage('');

        /*
         * Processa ?code=...
         * ou uma sessão já criada
         * automaticamente pelo Supabase.
         */
        await completeAuthRedirect();

        const user =
          await getCurrentUser();

        if (!active) {
          return;
        }

        if (!user) {
          throw new Error(
            'A sessão de recuperação não foi encontrada. Solicite um novo link para redefinir sua senha.',
          );
        }

        /*
         * Um usuário anônimo não deve
         * utilizar recuperação de senha.
         */
        if (
          isAnonymousUser(user)
        ) {
          throw new Error(
            'Esta sessão ainda é anônima e não possui uma senha recuperável.',
          );
        }

        if (!user.email) {
          throw new Error(
            'Não foi possível identificar o e-mail da conta.',
          );
        }

        setEmail(
          user.email,
        );

        setStatus(
          'ready',
        );
      } catch (error) {
        console.error(
          error,
        );

        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível validar o link de recuperação.',
        );

        setStatus(
          'error',
        );
      }
    }

    void prepareRecovery();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setErrorMessage('');

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        'As senhas não são iguais.',
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setErrorMessage(
        'A senha deve possuir pelo menos 8 caracteres.',
      );

      return;
    }

    setSaving(true);

    try {
      await updatePassword(
        password,
      );

      /*
       * Após alterar a senha,
       * encerramos a sessão criada
       * pelo link de recuperação.
       *
       * Assim o usuário testa a
       * nova senha no login normal.
       */
      await logout();

      setStatus(
        'success',
      );
    } catch (error) {
      console.error(
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a senha.',
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * CARREGANDO
   */
  if (
    status === 'loading'
  ) {
    return (
      <AuthShell
        title="Validando recuperação"
        subtitle="Estamos verificando o link enviado para o seu e-mail."
      >
        <div
          className="rounded-2xl border p-8 text-center"
          style={{
            borderColor:
              '#E2E8F0',

            backgroundColor:
              '#FFFFFF',
          }}
        >
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin"
            style={{
              color:
                '#D4A72C',
            }}
          />

          <p
            className="mt-5 text-sm"
            style={{
              color:
                '#64748B',
            }}
          >
            Validando sua sessão...
          </p>
        </div>
      </AuthShell>
    );
  }

  /*
   * ERRO
   */
  if (
    status === 'error'
  ) {
    return (
      <AuthShell
        title="Link inválido ou expirado"
        subtitle="Não foi possível continuar a recuperação da senha."
      >
        <div
          className="rounded-2xl border p-6 text-center"
          style={{
            borderColor:
              '#FCA5A5',

            backgroundColor:
              '#FEF2F2',
          }}
        >
          <XCircle
            size={44}
            className="mx-auto"
            style={{
              color:
                '#DC2626',
            }}
          />

          <p
            className="mt-4 text-sm leading-6"
            style={{
              color:
                '#991B1B',
            }}
          >
            {errorMessage}
          </p>

          <Link
            to="/forgot-password"
            className="mt-6 flex h-12 items-center justify-center rounded-xl font-semibold"
            style={{
              backgroundColor:
                '#D4A72C',

              color:
                '#080D1A',
            }}
          >
            Solicitar novo link
          </Link>
        </div>
      </AuthShell>
    );
  }

  /*
   * SUCESSO
   */
  if (
    status === 'success'
  ) {
    return (
      <AuthShell
        title="Senha atualizada"
        subtitle="Sua nova senha foi cadastrada com sucesso."
      >
        <div
          className="rounded-2xl border p-7 text-center"
          style={{
            borderColor:
              '#86EFAC',

            backgroundColor:
              '#F0FDF4',
          }}
        >
          <CheckCircle2
            size={48}
            className="mx-auto"
            style={{
              color:
                '#16A34A',
            }}
          />

          <h2
            className="mt-4 text-xl font-bold"
            style={{
              color:
                '#166534',
            }}
          >
            Senha alterada
          </h2>

          <p
            className="mt-3 text-sm leading-6"
            style={{
              color:
                '#475569',
            }}
          >
            Sua sessão de recuperação foi
            encerrada. Agora entre novamente
            utilizando sua nova senha.
          </p>

          <Link
            to="/login"
            className="mt-6 flex h-12 items-center justify-center rounded-xl font-semibold"
            style={{
              backgroundColor:
                '#D4A72C',

              color:
                '#080D1A',
            }}
          >
            Entrar com a nova senha
          </Link>
        </div>
      </AuthShell>
    );
  }

  /*
   * FORMULÁRIO
   */
  return (
    <AuthShell
      title="Crie uma nova senha"
      subtitle="Defina uma nova senha para voltar a acessar sua conta."
    >
      <div
        className="mb-6 rounded-xl border p-4"
        style={{
          borderColor:
            'rgba(22,163,74,0.25)',

          backgroundColor:
            'rgba(22,163,74,0.06)',
        }}
      >
        <div
          className="flex items-start gap-3"
        >
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0"
            style={{
              color:
                '#16A34A',
            }}
          />

          <div>
            <div
              className="text-sm font-semibold"
              style={{
                color:
                  '#166534',
              }}
            >
              Conta identificada
            </div>

            <div
              className="mt-1 break-all text-xs"
              style={{
                color:
                  '#64748B',
              }}
            >
              {email}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          className="mb-6 rounded-xl border p-4 text-sm"
          style={{
            borderColor:
              '#FCA5A5',

            backgroundColor:
              '#FEF2F2',

            color:
              '#B91C1C',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Nova senha
          </label>

          <div
            className="relative"
          >
            <KeyRound
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{
                color:
                  '#94A3B8',
              }}
            />

            <input
              id="password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              required
              minLength={8}
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              placeholder="Mínimo 8 caracteres"
              className="h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm outline-none"
              style={{
                borderColor:
                  '#CBD5E1',

                color:
                  '#111827',
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) =>
                    !value,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{
                color:
                  '#64748B',
              }}
              aria-label={
                showPassword
                  ? 'Ocultar senha'
                  : 'Mostrar senha'
              }
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                />
              ) : (
                <Eye
                  size={18}
                />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-semibold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Confirmar nova senha
          </label>

          <div
            className="relative"
          >
            <LockKeyhole
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{
                color:
                  '#94A3B8',
              }}
            />

            <input
              id="confirmPassword"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              required
              minLength={8}
              value={
                confirmPassword
              }
              onChange={(
                event,
              ) =>
                setConfirmPassword(
                  event.target
                    .value,
                )
              }
              placeholder="Digite novamente"
              className="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none"
              style={{
                borderColor:
                  '#CBD5E1',

                color:
                  '#111827',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={
            saving
          }
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor:
              '#D4A72C',

            color:
              '#080D1A',
          }}
        >
          {saving ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              Atualizando...
            </>
          ) : (
            'Salvar nova senha'
          )}
        </button>
      </form>
    </AuthShell>
  );
}