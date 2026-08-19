import {
  type FormEvent,
  useState,
} from 'react';

import type {
  MetaFunction,
} from '@remix-run/cloudflare';

import {
  Link,
} from '@remix-run/react';

import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from 'lucide-react';

import {
  AuthShell,
} from '~/components/auth/AuthShell';

import {
  requestPasswordReset,
} from '~/lib/auth/auth.client';

export const meta: MetaFunction = () => {
  return [
    {
      title:
        'Recuperar senha | 7System Builder',
    },
    {
      name:
        'description',

      content:
        'Recupere sua senha do 7System Builder.',
    },
  ];
};

export default function ForgotPassword() {
  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    sent,
    setSent,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await requestPasswordReset(
        email,
      );

      /*
       * Não informamos se o e-mail
       * realmente existe ou não.
       */
      setSent(true);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível solicitar a recuperação de senha.',
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * E-MAIL SOLICITADO
   */
  if (sent) {
    return (
      <AuthShell
        title="Verifique seu e-mail"
        subtitle="Enviamos as instruções para redefinir sua senha."
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
            className="mt-5 text-lg font-bold"
            style={{
              color:
                '#166534',
            }}
          >
            Solicitação recebida
          </h2>

          <p
            className="mt-3 text-sm leading-6"
            style={{
              color:
                '#475569',
            }}
          >
            Se existir uma conta vinculada
            ao endereço informado, você
            receberá um e-mail com o link
            para redefinir sua senha.
          </p>

          <div
            className="mt-5 rounded-xl bg-white p-4"
          >
            <div
              className="text-xs font-bold uppercase"
              style={{
                color:
                  '#64748B',
              }}
            >
              E-mail informado
            </div>

            <div
              className="mt-2 break-all text-sm font-semibold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              {email}
            </div>
          </div>

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
            Voltar para o Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Esqueci minha senha"
      subtitle="Informe o e-mail da sua conta para receber as instruções de recuperação."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-2 font-semibold"
          style={{
            color:
              '#B88918',
          }}
        >
          <ArrowLeft
            size={16}
          />

          Voltar para o Login
        </Link>
      }
    >
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
            htmlFor="email"
            className="mb-2 block text-sm font-semibold"
            style={{
              color:
                '#0B1739',
            }}
          >
            E-mail
          </label>

          <div
            className="relative"
          >
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{
                color:
                  '#94A3B8',
              }}
            />

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={
                email
              }
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              placeholder="seuemail@empresa.com.br"
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
            loading
          }
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor:
              '#D4A72C',

            color:
              '#080D1A',
          }}
        >
          {loading ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </button>
      </form>
    </AuthShell>
  );
}