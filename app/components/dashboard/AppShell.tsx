import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from '@remix-run/react';

import {
  Bot,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  LoaderCircle,
  LogOut,
  PlusCircle,
  Rocket,
  Settings,
  UserCircle,
} from 'lucide-react';

import {
  ProtectedRoute,
} from '~/components/auth/ProtectedRoute';

import {
  logout,
  subscribeToAuthChanges,
} from '~/lib/auth/auth.client';

import {
  getCurrentProfile,
  PROFILE_UPDATED_EVENT,
} from '~/lib/profiles/profile.client';

interface AppShellProps {
  children: ReactNode;
}

const navigation = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: 'Novo Projeto',
    path: '/new-project',
    icon: PlusCircle,
    enabled: true,
  },
  {
    label: 'Meus Projetos',
    path: '/projects',
    icon: FolderKanban,
    enabled: true,
  },
  {
    label: 'Templates',
    path: '/templates',
    icon: LayoutTemplate,
    enabled: true,
  },
  {
    label: 'Builder IA',
    path: '/builder',
    icon: Bot,
    enabled: true,
  },
  {
    label: 'Deploys',
    path: '/deploys',
    icon: Rocket,
    enabled: false,
  },
  {
    label: 'Empresa & Equipe',
    path: '/organization',
    icon: Settings,
    enabled: true,
  },
];


export function AppShell({
  children,
}: AppShellProps) {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [
    userName,
    setUserName,
  ] =
    useState('Usuário');

  const [
    userEmail,
    setUserEmail,
  ] =
    useState('');

  const [
    loadingUser,
    setLoadingUser,
  ] =
    useState(true);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  const [
    logoutError,
    setLogoutError,
  ] =
    useState('');

  /*
   * Carrega o usuário atual.
   */

  /*
 * Carrega o perfil atual.
 */
useEffect(() => {
  let active = true;

  async function loadProfile() {
    try {
      const profile =
        await getCurrentProfile();

      if (!active) {
        return;
      }

      const fallbackName =
        profile.email
          .split('@')[0] ||
        'Usuário';

      setUserName(
        profile.fullName.trim() ||
        fallbackName,
      );

      setUserEmail(
        profile.email,
      );
    } catch (error) {
      console.error(
        'Erro ao carregar perfil:',
        error,
      );
    } finally {
      if (active) {
        setLoadingUser(
          false,
        );
      }
    }
  }

  void loadProfile();

  /*
   * Mantém o menu sincronizado
   * com login/logout.
   */
  const unsubscribe =
    subscribeToAuthChanges(
      (
        _event,
        session,
      ) => {
        if (!active) {
          return;
        }

        if (!session?.user) {
          setUserName(
            'Usuário',
          );

          setUserEmail('');

          setLoadingUser(
            false,
          );

          return;
        }

        void loadProfile();
      },
    );

  /*
   * Atualiza imediatamente quando
   * Minha Conta salva o perfil.
   */
  function handleProfileUpdated() {
    if (!active) {
      return;
    }

    void loadProfile();
  }

  window.addEventListener(
    PROFILE_UPDATED_EVENT,
    handleProfileUpdated,
  );

  return () => {
    active = false;

    unsubscribe();

    window.removeEventListener(
      PROFILE_UPDATED_EVENT,
      handleProfileUpdated,
    );
  };
}, []);
 
  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setLogoutError('');

    try {
      await logout();

      navigate(
        '/login',
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error(
        'Erro ao sair:',
        error,
      );

      setLogoutError(
        error instanceof Error
          ? error.message
          : 'Não foi possível sair da conta.',
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <ProtectedRoute>
      <div
        className="flex min-h-screen w-full"
        style={{
          backgroundColor:
            '#F8FAFC',
        }}
      >
        <aside
          className="flex w-[260px] shrink-0 flex-col border-r"
          style={{
            backgroundColor:
              '#080D1A',

            borderColor:
              'rgba(255,255,255,0.08)',
          }}
        >
          {/* LOGO */}
          <div
            className="flex h-20 items-center border-b px-6"
            style={{
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
          >
            <img
              src="/logo-dark-styled.png"
              alt="7System Builder"
              className="max-h-11 max-w-[180px] object-contain"
            />
          </div>

          {/* NAVEGAÇÃO */}
          <nav
            className="flex-1 space-y-1 overflow-y-auto p-4"
          >
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  item.path === '/'
                    ? location
                        .pathname ===
                      '/'
                    : location
                        .pathname
                        .startsWith(
                          item.path,
                        );

                if (
                  !item.enabled
                ) {
                  return (
                    <div
                      key={
                        item.label
                      }
                      className="flex items-center gap-3 rounded-lg px-4 py-3 opacity-40"
                      style={{
                        color:
                          '#CBD5E1',
                      }}
                    >
                      <Icon
                        size={19}
                      />

                      <span
                        className="flex-1 text-sm font-medium"
                      >
                        {
                          item.label
                        }
                      </span>

                      <span
                        className="rounded px-2 py-1 text-[10px]"
                        style={{
                          backgroundColor:
                            'rgba(212,167,44,0.12)',

                          color:
                            '#F1C75B',
                        }}
                      >
                        Em breve
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={
                      item.label
                    }
                    to={
                      item.path
                    }
                    className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all"
                    style={{
                      backgroundColor:
                        active
                          ? 'rgba(212,167,44,0.14)'
                          : 'transparent',

                      color:
                        active
                          ? '#F1C75B'
                          : '#CBD5E1',
                    }}
                  >
                    <Icon
                      size={19}
                    />

                    <span
                      className="text-sm font-medium"
                    >
                      {
                        item.label
                      }
                    </span>
                  </Link>
                );
              },
            )}
          </nav>

          {/* USUÁRIO */}
          <div
            className="border-t p-4"
            style={{
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  '#0B1739',
              }}
            >
              {loadingUser ? (
                <div
                  className="flex items-center justify-center py-4"
                >
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                    style={{
                      color:
                        '#D4A72C',
                    }}
                  />
                </div>
              ) : (
                <>
                  <div
                    className="flex items-center gap-3"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          'rgba(212,167,44,0.14)',

                        color:
                          '#F1C75B',
                      }}
                    >
                      <UserCircle
                        size={23}
                      />
                    </div>

                    <div
                      className="min-w-0 flex-1"
                    >
                      <div
                        className="truncate text-sm font-semibold"
                        style={{
                          color:
                            '#FFFFFF',
                        }}
                      >
                        {userName}
                      </div>

                      <div
                        className="mt-0.5 truncate text-[11px]"
                        style={{
                          color:
                            '#94A3B8',
                        }}
                        title={
                          userEmail
                        }
                      >
                        {userEmail}
                      </div>
                    </div>
                  </div>

                  <div
                    className="my-3 h-px"
                    style={{
                      backgroundColor:
                        'rgba(255,255,255,0.08)',
                    }}
                  />

                  <Link
                    to="/account"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
                    style={{
                      backgroundColor:
                        location
                          .pathname ===
                        '/account'
                          ? 'rgba(212,167,44,0.14)'
                          : 'transparent',

                      color:
                        location
                          .pathname ===
                        '/account'
                          ? '#F1C75B'
                          : '#CBD5E1',
                    }}
                  >
                    <UserCircle
                      size={18}
                    />

                    Minha Conta
                  </Link>

                  <button
                    type="button"
                    disabled={
                      loggingOut
                    }
                    onClick={() => {
                      void handleLogout();
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      color:
                        '#FCA5A5',
                    }}
                  >
                    {loggingOut ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <LogOut
                        size={18}
                      />
                    )}

                    {loggingOut
                      ? 'Saindo...'
                      : 'Sair'}
                  </button>
                </>
              )}

              {logoutError && (
                <div
                  className="mt-3 rounded-lg p-2 text-xs"
                  style={{
                    backgroundColor:
                      'rgba(220,38,38,0.12)',

                    color:
                      '#FCA5A5',
                  }}
                >
                  {logoutError}
                </div>
              )}
            </div>

            <div
              className="mt-3 text-center text-[10px] font-medium"
              style={{
                color:
                  '#475569',
              }}
            >
              7SYSTEM BUILDER
            </div>
          </div>
        </aside>

        <main
          className="min-w-0 flex-1"
        >
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

