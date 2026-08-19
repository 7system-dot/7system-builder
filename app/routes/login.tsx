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
  useNavigate,
} from '@remix-run/react';

import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from 'lucide-react';

import {
  AuthShell,
} from '~/components/auth/AuthShell';

import {
  BuilderAuthError,
  getCurrentUser,
  isAnonymousUser,
  loginWithPassword,
} from '~/lib/auth/auth.client';

export const meta: MetaFunction = () => {
  return [
    {
      title:
        'Entrar | 7System Builder',
    },
    {
      name:
        'description',

      content:
        'Entre na sua conta do 7System Builder.',
    },
  ];
};

export default function Login() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  const [
    anonymousSession,
    setAnonymousSession,
  ] =
    useState(false);

  /*
   * Verifica a sessão apenas no navegador.
   */
  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const user =
          await getCurrentUser();

        if (!active) {
          return;
        }

        if (
          user &&
          !isAnonymousUser(user)
        ) {
          navigate('/', {
            replace: true,
          });

          return;
        }

        setAnonymousSession(
          Boolean(
            user &&
              isAnonymousUser(user),
          ),
        );
      } catch (error) {
        console.error(
          'Erro ao verificar sessão:',
          error,
        );
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

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
      await loginWithPassword(
        email,
        password,
      );

      navigate('/', {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      if (
        error instanceof
          BuilderAuthError &&
        error.code ===
          'ANONYMOUS_SESSION_ACTIVE'
      ) {
        setAnonymousSession(true);

        setErrorMessage(
          'Este navegador possui uma sessão anônima com projetos. Para não perder o vínculo desses projetos, converta a sessão em uma conta permanente.',
        );

        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua conta para continuar desenvolvendo seus projetos."
      footer={
        <>
          Ainda não possui conta?{' '}
          <Link
            to="/register"
            className="font-semibold"
            style={{
              color: '#B88918',
            }}
          >
            Criar conta
          </Link>
        </>
      }
    >
      {anonymousSession && (
        <div
          className="mb-6 rounded-xl border p-4"
          style={{
            borderColor:
              'rgba(212,167,44,0.35)',

            backgroundColor:
              'rgba(212,167,44,0.08)',
          }}
        >
          <div
            className="flex items-start gap-3"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
              style={{
                color: '#B88918',
              }}
            />

            <div>
              <div
                className="text-sm font-semibold"
                style={{
                  color: '#0B1739',
                }}
              >
                Projetos anônimos detectados
              </div>

              <p
                className="mt-1 text-xs leading-5"
                style={{
                  color: '#64748B',
                }}
              >
                Existe uma sessão anônima
                neste navegador. Para
                preservar esses projetos,
                transforme essa sessão em
                uma conta.
              </p>

              <Link
                to="/register"
                className="mt-3 inline-block text-sm font-semibold"
                style={{
                  color: '#B88918',
                }}
              >
                Preservar projetos e criar conta
              </Link>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className="mb-6 rounded-xl border p-4 text-sm"
          style={{
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            color: '#B91C1C',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold"
            style={{
              color: '#0B1739',
            }}
          >
            E-mail
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{
                color: '#94A3B8',
              }}
            />

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="seuemail@empresa.com.br"
              className="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition"
              style={{
                borderColor: '#CBD5E1',
                color: '#111827',
              }}
            />
          </div>
        </div>

        <div>
          <div
            className="mb-2 flex items-center justify-between"
          >
            <label
              htmlFor="password"
              className="text-sm font-semibold"
              style={{
                color: '#0B1739',
              }}
            >
              Senha
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold"
              style={{
                color: '#B88918',
              }}
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{
                color: '#94A3B8',
              }}
            />

            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Digite sua senha"
              className="h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm outline-none transition"
              style={{
                borderColor: '#CBD5E1',
                color: '#111827',
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{
                color: '#64748B',
              }}
              aria-label={
                showPassword
                  ? 'Ocultar senha'
                  : 'Mostrar senha'
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: '#D4A72C',
            color: '#080D1A',
          }}
        >
          {loading ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </AuthShell>
  );
}