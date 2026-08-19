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
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import {
  AuthShell,
} from '~/components/auth/AuthShell';

import {
  getCurrentUser,
  isAnonymousUser,
  registerWithPassword,
  startAnonymousUpgrade,
} from '~/lib/auth/auth.client';

export const meta: MetaFunction = () => {
  return [
    {
      title:
        'Criar conta | 7System Builder',
    },
    {
      name:
        'description',

      content:
        'Crie sua conta no 7System Builder.',
    },
  ];
};

type AccountMode =
  | 'checking'
  | 'anonymous'
  | 'new'
  | 'permanent';

export default function Register() {
  const navigate =
    useNavigate();

  const [
    accountMode,
    setAccountMode,
  ] =
    useState<AccountMode>(
      'checking',
    );

  const [
    name,
    setName,
  ] =
    useState('');

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
    successMessage,
    setSuccessMessage,
  ] =
    useState('');

  useEffect(() => {
    let active = true;

    async function checkUser() {
      try {
        const user =
          await getCurrentUser();

        if (!active) {
          return;
        }

        if (!user) {
          setAccountMode('new');

          return;
        }

        if (
          isAnonymousUser(user)
        ) {
          setAccountMode(
            'anonymous',
          );

          return;
        }

        setAccountMode(
          'permanent',
        );
      } catch (error) {
        console.error(
          'Erro ao verificar usuário:',
          error,
        );

        if (active) {
          setAccountMode('new');
        }
      }
    }

    void checkUser();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      loading ||
      accountMode === 'checking'
    ) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      /*
       * Se já existe usuário anônimo,
       * NÃO criamos outro UUID.
       */
      if (
        accountMode ===
        'anonymous'
      ) {
        await startAnonymousUpgrade(
          email,
          name,
        );

        setSuccessMessage(
          'Enviamos uma confirmação para o seu e-mail. Seus projetos continuam vinculados ao mesmo usuário. Depois de confirmar o e-mail, você definirá sua senha.',
        );

        return;
      }

      if (
        accountMode ===
        'permanent'
      ) {
        navigate('/', {
          replace: true,
        });

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setErrorMessage(
          'As senhas não são iguais.',
        );

        return;
      }

      const result =
        await registerWithPassword(
          email,
          password,
          name,
        );

      if (
        result.mode ===
        'anonymous-upgrade-started'
      ) {
        setSuccessMessage(
          'Enviamos uma confirmação para o seu e-mail. Seus projetos serão preservados.',
        );

        return;
      }

      /*
       * Caso confirmação de e-mail
       * esteja desabilitada no Supabase,
       * poderá existir sessão imediatamente.
       */
      if (result.session) {
        navigate('/', {
          replace: true,
        });

        return;
      }

      setSuccessMessage(
        'Conta criada. Enviamos uma mensagem de confirmação para o seu e-mail.',
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (
    accountMode ===
    'permanent'
  ) {
    return (
      <AuthShell
        title="Conta já conectada"
        subtitle="Você já possui uma sessão permanente ativa."
      >
        <div
          className="rounded-2xl border p-6 text-center"
          style={{
            borderColor: '#E2E8F0',
            backgroundColor: '#FFFFFF',
          }}
        >
          <CheckCircle2
            size={42}
            className="mx-auto"
            style={{
              color: '#16A34A',
            }}
          />

          <h2
            className="mt-4 font-bold"
            style={{
              color: '#0B1739',
            }}
          >
            Você já está autenticado
          </h2>

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

  return (
    <AuthShell
      title={
        accountMode ===
        'anonymous'
          ? 'Proteja seus projetos'
          : 'Criar conta'
      }
      subtitle={
        accountMode ===
        'anonymous'
          ? 'Transforme sua sessão atual em uma conta permanente sem perder seus projetos.'
          : 'Crie sua conta para acessar seus projetos no 7System Builder.'
      }
      footer={
        <>
          Já possui conta?{' '}
          <Link
            to="/login"
            className="font-semibold"
            style={{
              color: '#B88918',
            }}
          >
            Entrar
          </Link>
        </>
      }
    >
      {accountMode ===
        'anonymous' && (
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
                color: '#16A34A',
              }}
            />

            <div>
              <div
                className="text-sm font-semibold"
                style={{
                  color: '#166534',
                }}
              >
                Seus projetos serão preservados
              </div>

              <p
                className="mt-1 text-xs leading-5"
                style={{
                  color: '#64748B',
                }}
              >
                Detectamos uma sessão
                anônima. Vamos vincular
                seu e-mail ao mesmo usuário,
                mantendo o UUID e os projetos
                existentes.
              </p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{
            borderColor: '#86EFAC',
            backgroundColor: '#F0FDF4',
          }}
        >
          <CheckCircle2
            size={42}
            className="mx-auto"
            style={{
              color: '#16A34A',
            }}
          />

          <h2
            className="mt-4 text-lg font-bold"
            style={{
              color: '#166534',
            }}
          >
            Verifique seu e-mail
          </h2>

          <p
            className="mt-2 text-sm leading-6"
            style={{
              color: '#475569',
            }}
          >
            {successMessage}
          </p>

          <div
            className="mt-5 rounded-xl p-3 text-xs"
            style={{
              backgroundColor:
                '#FFFFFF',

              color:
                '#64748B',
            }}
          >
            E-mail enviado para:
            <div
              className="mt-1 font-semibold"
              style={{
                color: '#0B1739',
              }}
            >
              {email}
            </div>
          </div>
        </div>
      )}

      {!successMessage && (
        <>
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
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold"
                style={{
                  color: '#0B1739',
                }}
              >
                Nome
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: '#94A3B8',
                  }}
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Seu nome"
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

            {accountMode !==
              'anonymous' && (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold"
                    style={{
                      color: '#0B1739',
                    }}
                  >
                    Senha
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{
                        color:
                          '#94A3B8',
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
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) =>
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
                      color: '#0B1739',
                    }}
                  >
                    Confirmar senha
                  </label>

                  <div className="relative">
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
                      name="confirmPassword"
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
                      onChange={(event) =>
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
              </>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                accountMode ===
                  'checking'
              }
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor:
                  '#D4A72C',

                color:
                  '#080D1A',
              }}
            >
              {loading ||
              accountMode ===
                'checking' ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  {accountMode ===
                  'checking'
                    ? 'Verificando...'
                    : 'Processando...'}
                </>
              ) : accountMode ===
                'anonymous' ? (
                'Proteger meus projetos'
              ) : (
                'Criar minha conta'
              )}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}