import {
  type FormEvent,
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
  Phone,
  Save,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

import {
  AppShell,
} from '~/components/dashboard/AppShell';

import {
  getCurrentUser,
} from '~/lib/auth/auth.client';

import {
  getCurrentProfile,
  updateCurrentProfile,
} from '~/lib/profiles/profile.client';

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
        'Gerencie seu perfil no 7System Builder.',
    },
  ];
};

interface AccountInfo {
  id: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: string;
}

export default function Account() {
  const [
    account,
    setAccount,
  ] =
    useState<AccountInfo | null>(
      null,
    );

  const [
    fullName,
    setFullName,
  ] =
    useState('');

  const [
    phone,
    setPhone,
  ] =
    useState('');

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState('');

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        setLoading(true);
        setErrorMessage('');

        const [
          user,
          profile,
        ] =
          await Promise.all([
            getCurrentUser(),
            getCurrentProfile(),
          ]);

        if (!active) {
          return;
        }

        if (!user) {
          throw new Error(
            'Nenhum usuário autenticado foi encontrado.',
          );
        }

        setAccount({
          id:
            user.id,

          email:
            user.email ??
            profile.email,

          emailConfirmed:
            Boolean(
              user.email_confirmed_at,
            ),

          createdAt:
            user.created_at ??
            '',
        });

        setFullName(
          profile.fullName,
        );

        setPhone(
          profile.phone ??
          '',
        );
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


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const profile =
        await updateCurrentProfile({
          fullName,
          phone,
        });

      setFullName(
        profile.fullName,
      );

      setPhone(
        profile.phone ??
        '',
      );

      setSuccessMessage(
        'Perfil atualizado com sucesso.',
      );
    } catch (error) {
      console.error(
        'Erro ao salvar perfil:',
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar seu perfil.',
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <AppShell>
      <div
        className="mx-auto w-full max-w-5xl p-8"
      >
        {/* CABEÇALHO */}
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
            Gerencie seus dados pessoais
            no 7System Builder.
          </p>
        </div>


        {/* CARREGANDO */}
        {loading && (
          <div
            className="mt-8 flex min-h-[320px] items-center justify-center rounded-2xl border bg-white"
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
                Carregando seu perfil...
              </p>
            </div>
          </div>
        )}


        {!loading &&
          account && (
          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-6"
          >
            {/* PERFIL */}
            <div
              className="overflow-hidden rounded-2xl border bg-white"
              style={{
                borderColor:
                  '#E2E8F0',
              }}
            >
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
                    {fullName ||
                      'Seu perfil'}
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color:
                        '#64748B',
                    }}
                  >
                    Informações pessoais
                  </p>
                </div>
              </div>


              <div
                className="grid gap-6 p-6 md:grid-cols-2"
              >
                {/* NOME */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold"
                    style={{
                      color:
                        '#0B1739',
                    }}
                  >
                    Nome completo
                  </label>

                  <div
                    className="relative"
                  >
                    <UserCircle
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{
                        color:
                          '#94A3B8',
                      }}
                    />

                    <input
                      id="fullName"
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      value={
                        fullName
                      }
                      onChange={(
                        event,
                      ) =>
                        setFullName(
                          event.target.value,
                        )
                      }
                      className="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none"
                      style={{
                        borderColor:
                          '#CBD5E1',

                        color:
                          '#111827',
                      }}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>


                {/* TELEFONE */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold"
                    style={{
                      color:
                        '#0B1739',
                    }}
                  >
                    Telefone / WhatsApp
                  </label>

                  <div
                    className="relative"
                  >
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{
                        color:
                          '#94A3B8',
                      }}
                    />

                    <input
                      id="phone"
                      type="tel"
                      maxLength={30}
                      value={
                        phone
                      }
                      onChange={(
                        event,
                      ) =>
                        setPhone(
                          event.target.value,
                        )
                      }
                      className="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none"
                      style={{
                        borderColor:
                          '#CBD5E1',

                        color:
                          '#111827',
                      }}
                      placeholder="(81) 99999-9999"
                    />
                  </div>
                </div>


                {/* EMAIL */}
                <div>
                  <label
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
                      type="email"
                      value={
                        account.email
                      }
                      readOnly
                      className="h-12 w-full cursor-not-allowed rounded-xl border pl-11 pr-4 text-sm"
                      style={{
                        borderColor:
                          '#E2E8F0',

                        backgroundColor:
                          '#F8FAFC',

                        color:
                          '#64748B',
                      }}
                    />
                  </div>

                  <p
                    className="mt-2 text-xs"
                    style={{
                      color:
                        '#94A3B8',
                    }}
                  >
                    A alteração de e-mail
                    será disponibilizada em
                    um fluxo separado de
                    segurança.
                  </p>
                </div>


                {/* STATUS */}
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold"
                    style={{
                      color:
                        '#0B1739',
                    }}
                  >
                    Status da conta
                  </label>

                  <div
                    className="flex h-12 items-center gap-2 rounded-xl border px-4"
                    style={{
                      borderColor:
                        account
                          .emailConfirmed
                          ? '#86EFAC'
                          : '#FCD34D',

                      backgroundColor:
                        account
                          .emailConfirmed
                          ? '#F0FDF4'
                          : '#FFFBEB',

                      color:
                        account
                          .emailConfirmed
                          ? '#166534'
                          : '#92400E',
                    }}
                  >
                    {account
                      .emailConfirmed ? (
                      <CheckCircle2
                        size={18}
                      />
                    ) : (
                      <ShieldCheck
                        size={18}
                      />
                    )}

                    <span
                      className="text-sm font-semibold"
                    >
                      {account
                        .emailConfirmed
                        ? 'E-mail confirmado'
                        : 'Confirmação pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* MENSAGENS */}
            {errorMessage && (
              <div
                className="rounded-xl border p-4 text-sm"
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

            {successMessage && (
              <div
                className="flex items-center gap-3 rounded-xl border p-4 text-sm"
                style={{
                  borderColor:
                    '#86EFAC',

                  backgroundColor:
                    '#F0FDF4',

                  color:
                    '#166534',
                }}
              >
                <CheckCircle2
                  size={19}
                />

                {successMessage}
              </div>
            )}


            {/* ID DO USUÁRIO */}
            <div
              className="rounded-2xl border bg-white p-6"
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
                Esse UUID identifica sua
                conta e seus vínculos com
                as organizações.
              </p>
            </div>


            {/* SALVAR */}
            <div
              className="flex justify-end"
            >
              <button
                type="submit"
                disabled={
                  saving
                }
                className="flex h-12 items-center justify-center gap-2 rounded-xl px-6 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
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

                    Salvando...
                  </>
                ) : (
                  <>
                    <Save
                      size={18}
                    />

                    Salvar alterações
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}