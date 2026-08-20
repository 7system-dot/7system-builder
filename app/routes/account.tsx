import {
  useEffect,
  useState,
} from 'react';

import type {
  MetaFunction,
} from '@remix-run/cloudflare';

import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

import {
  AppShell,
} from '~/components/dashboard/AppShell';

import {
  getCurrentUser,
} from '~/lib/auth/auth.client';

export const meta: MetaFunction = () => {
  return [
    {
      title:
        'Minha Conta | 7System Builder',
    },
    {
      name:
        'description',

      content:
        'Informações da sua conta no 7System Builder.',
    },
  ];
};

interface AccountData {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: string;
}

export default function Account() {
  const [
    account,
    setAccount,
  ] =
    useState<AccountData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        setLoading(true);
        setErrorMessage('');

        const user =
          await getCurrentUser();

        if (!active) {
          return;
        }

        if (!user) {
          throw new Error(
            'Nenhum usuário autenticado foi encontrado.',
          );
        }

        const metadataName =
          user.user_metadata
            ?.name;

        const name =
          typeof metadataName ===
            'string' &&
          metadataName.trim()
            ? metadataName.trim()
            : user.email
              ?.split('@')[0] ??
              'Usuário';

        setAccount({
          id:
            user.id,

          name,

          email:
            user.email ?? '',

          emailConfirmed:
            Boolean(
              user.email_confirmed_at,
            ),

          createdAt:
            user.created_at ?? '',
        });
      } catch (error) {
        console.error(
          'Erro ao carregar conta:',
          error,
        );

        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os dados da conta.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <div
        className="mx-auto w-full max-w-5xl p-8"
      >
        <div>
          <div
            className="text-sm font-semibold"
            style={{
              color:
                '#B88918',
            }}
          >
            CONTA
          </div>

          <h1
            className="mt-2 text-3xl font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Minha Conta
          </h1>

          <p
            className="mt-2 text-sm"
            style={{
              color:
                '#64748B',
            }}
          >
            Visualize as informações
            vinculadas à sua conta do
            7System Builder.
          </p>
        </div>

        {loading && (
          <div
            className="mt-8 flex min-h-[300px] items-center justify-center rounded-2xl border bg-white"
            style={{
              borderColor:
                '#E2E8F0',
            }}
          >
            <div
              className="text-center"
            >
              <LoaderCircle
                size={36}
                className="mx-auto animate-spin"
                style={{
                  color:
                    '#D4A72C',
                }}
              />

              <p
                className="mt-4 text-sm"
                style={{
                  color:
                    '#64748B',
                }}
              >
                Carregando sua conta...
              </p>
            </div>
          </div>
        )}

        {!loading &&
          errorMessage && (
          <div
            className="mt-8 rounded-2xl border p-6"
            style={{
              borderColor:
                '#FCA5A5',

              backgroundColor:
                '#FEF2F2',

              color:
                '#991B1B',
            }}
          >
            {errorMessage}
          </div>
        )}

        {!loading &&
          account && (
          <div
            className="mt-8 overflow-hidden rounded-2xl border bg-white"
            style={{
              borderColor:
                '#E2E8F0',
            }}
          >
            {/* CABEÇALHO */}
            <div
              className="flex items-center gap-4 border-b p-6"
              style={{
                borderColor:
                  '#E2E8F0',

                backgroundColor:
                  '#F8FAFC',
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    'rgba(212,167,44,0.14)',

                  color:
                    '#B88918',
                }}
              >
                <UserCircle
                  size={32}
                />
              </div>

              <div>
                <h2
                  className="text-xl font-bold"
                  style={{
                    color:
                      '#0B1739',
                  }}
                >
                  {account.name}
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color:
                      '#64748B',
                  }}
                >
                  Conta do 7System Builder
                </p>
              </div>
            </div>

            {/* INFORMAÇÕES */}
            <div
              className="grid gap-6 p-6 md:grid-cols-2"
            >
              <div
                className="rounded-xl border p-5"
                style={{
                  borderColor:
                    '#E2E8F0',
                }}
              >
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase"
                  style={{
                    color:
                      '#64748B',
                  }}
                >
                  <Mail
                    size={16}
                  />

                  E-mail
                </div>

                <div
                  className="mt-3 break-all text-sm font-semibold"
                  style={{
                    color:
                      '#0B1739',
                  }}
                >
                  {account.email}
                </div>
              </div>

              <div
                className="rounded-xl border p-5"
                style={{
                  borderColor:
                    '#E2E8F0',
                }}
              >
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase"
                  style={{
                    color:
                      '#64748B',
                  }}
                >
                  <ShieldCheck
                    size={16}
                  />

                  Status
                </div>

                <div
                  className="mt-3 flex items-center gap-2 text-sm font-semibold"
                  style={{
                    color:
                      account
                        .emailConfirmed
                        ? '#166534'
                        : '#B45309',
                  }}
                >
                  {account
                    .emailConfirmed && (
                    <CheckCircle2
                      size={17}
                    />
                  )}

                  {account
                    .emailConfirmed
                    ? 'E-mail confirmado'
                    : 'E-mail pendente'}
                </div>
              </div>

              <div
                className="rounded-xl border p-5 md:col-span-2"
                style={{
                  borderColor:
                    '#E2E8F0',
                }}
              >
                <div
                  className="text-xs font-bold uppercase"
                  style={{
                    color:
                      '#64748B',
                  }}
                >
                  ID do usuário
                </div>

                <div
                  className="mt-3 break-all font-mono text-sm"
                  style={{
                    color:
                      '#0B1739',
                  }}
                >
                  {account.id}
                </div>

                <p
                  className="mt-2 text-xs"
                  style={{
                    color:
                      '#94A3B8',
                  }}
                >
                  Este identificador
                  vincula sua conta aos
                  seus projetos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}