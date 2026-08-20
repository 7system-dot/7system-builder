import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from '@remix-run/react';

import {
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react';

import {
  getCurrentUser,
  isAnonymousUser,
} from '~/lib/auth/auth.client';

interface ProtectedRouteProps {
  children: ReactNode;
}

type AuthStatus =
  | 'checking'
  | 'allowed'
  | 'error';

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const navigate =
    useNavigate();

  const [
    status,
    setStatus,
  ] =
    useState<AuthStatus>(
      'checking',
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const user =
          await getCurrentUser();

        if (!active) {
          return;
        }

        /*
         * Nenhuma sessão.
         *
         * Vai para Login.
         */
        if (!user) {
          navigate(
            '/login',
            {
              replace: true,
            },
          );

          return;
        }

        /*
         * Sessão anônima antiga.
         *
         * Não apagamos o usuário.
         * Enviamos para o cadastro
         * para preservar o UUID.
         */
        if (
          isAnonymousUser(
            user,
          )
        ) {
          navigate(
            '/register',
            {
              replace: true,
            },
          );

          return;
        }

        /*
         * Conta permanente.
         */
        setStatus(
          'allowed',
        );
      } catch (error) {
        console.error(
          'Erro ao validar acesso:',
          error,
        );

        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível validar sua sessão.',
        );

        setStatus(
          'error',
        );
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, [navigate]);

  /*
   * Enquanto verifica o Supabase,
   * não mostra o conteúdo privado.
   */
  if (
    status === 'checking'
  ) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor:
            '#F8FAFC',
        }}
      >
        <div
          className="text-center"
        >
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin"
            style={{
              color:
                '#D4A72C',
            }}
          />

          <div
            className="mt-4 text-sm font-semibold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Verificando sua sessão...
          </div>
        </div>
      </div>
    );
  }

  /*
   * Erro inesperado de Auth.
   */
  if (
    status === 'error'
  ) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{
          backgroundColor:
            '#F8FAFC',
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl border bg-white p-8 text-center"
          style={{
            borderColor:
              '#E2E8F0',
          }}
        >
          <ShieldAlert
            size={42}
            className="mx-auto"
            style={{
              color:
                '#DC2626',
            }}
          />

          <h1
            className="mt-5 text-xl font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Não foi possível validar seu acesso
          </h1>

          <p
            className="mt-3 text-sm leading-6"
            style={{
              color:
                '#64748B',
            }}
          >
            {errorMessage}
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
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}