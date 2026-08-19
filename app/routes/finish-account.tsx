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
  finishAccount,
  getCurrentUser,
} from '~/lib/auth/auth.client';

export const meta: MetaFunction = () => {
  return [
    {
      title:
        'Finalizar conta | 7System Builder',
    },
    {
      name:
        'description',

      content:
        'Finalize sua conta no 7System Builder.',
    },
  ];
};

type PageStatus =
  | 'loading'
  | 'ready'
  | 'success'
  | 'error';

export default function FinishAccount() {
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
    userId,
    setUserId,
  ] =
    useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  /*
   * Quando a página abre depois do clique
   * no e-mail, processamos primeiro o
   * retorno do Supabase.
   */
  useEffect(() => {
    let active = true;

    async function prepareAccount() {
      try {
        setStatus(
          'loading',
        );

        setErrorMessage('');

        await completeAuthRedirect();

        const user =
          await getCurrentUser();

        if (!active) {
          return;
        }

        if (!user) {
          throw new Error(
            'A sessão de confirmação não foi encontrada. Solicite um novo e-mail de confirmação.',
          );
        }

        if (!user.email) {
          throw new Error(
            'Nenhum e-mail foi encontrado para esta conta.',
          );
        }

        if (
          !user.email_confirmed_at
        ) {
          throw new Error(
            'O e-mail ainda não foi confirmado. Abra o link enviado pelo Supabase e tente novamente.',
          );
        }

        setEmail(
          user.email,
        );

        setUserId(
          user.id,
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
            : 'Não foi possível validar a confirmação.',
        );

        setStatus(
          'error',
        );
      }
    }

    void prepareAccount();

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
      const user =
        await finishAccount(
          password,
        );

      setEmail(
        user.email ?? email,
      );

      setUserId(
        user.id,
      );

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
          : 'Não foi possível finalizar a conta.',
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
        title="Confirmando sua conta"
        subtitle="Estamos validando o link de confirmação."
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
        title="Não foi possível confirmar"
        subtitle="O link não pôde ser validado."
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
            size={42}
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
            to="/register"
            className="mt-6 flex h-12 items-center justify-center rounded-xl font-semibold"
            style={{
              backgroundColor:
                '#D4A72C',

              color:
                '#080D1A',
            }}
          >
            Voltar para criar conta
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
        title="Conta protegida"
        subtitle="Sua conta permanente foi configurada com sucesso."
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
            Conta finalizada
          </h2>

          <p
            className="mt-2 text-sm leading-6"
            style={{
              color:
                '#475569',
            }}
          >
            Seu e-mail e sua senha
            agora estão vinculados ao
            7System Builder.
          </p>

          <div
            className="mt-6 rounded-xl bg-white p-4 text-left"
          >
            <div
              className="text-xs font-bold uppercase"
              style={{
                color:
                  '#64748B',
              }}
            >
              E-mail
            </div>

            <div
              className="mt-1 break-all text-sm font-semibold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              {email}
            </div>

            <div
              className="mt-4 text-xs font-bold uppercase"
              style={{
                color:
                  '#64748B',
              }}
            >
              ID do usuário
            </div>

            <div
              className="mt-1 break-all font-mono text-xs"
              style={{
                color:
                  '#0B1739',
              }}
            >
              {userId}
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 flex h-12 items-center justify-center rounded-xl font-semibold"
            style={{
              backgroundColor:
                '#D4A72C',

              color:
                '#080D1A',
            }}
          >
            Ir para o Dashboard
          </Link>
        </div>
      </AuthShell>
    );
  }

  /*
   * PRONTO PARA DEFINIR SENHA
   */
  return (
    <AuthShell
      title="Defina sua senha"
      subtitle="Seu e-mail foi confirmado. Agora proteja definitivamente sua conta."
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
              E-mail confirmado
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

      <div
        className="mb-6 rounded-xl p-4"
        style={{
          backgroundColor:
            '#F8FAFC',
        }}
      >
        <div
          className="text-xs font-bold uppercase"
          style={{
            color:
              '#64748B',
          }}
        >
          Seu UUID
        </div>

        <div
          className="mt-2 break-all font-mono text-xs"
          style={{
            color:
              '#0B1739',
          }}
        >
          {userId}
        </div>

        <p
          className="mt-2 text-xs leading-5"
          style={{
            color:
              '#64748B',
          }}
        >
          Seus projetos continuam
          vinculados a este identificador.
        </p>
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

              Finalizando...
            </>
          ) : (
            'Finalizar minha conta'
          )}
        </button>
      </form>
    </AuthShell>
  );
}