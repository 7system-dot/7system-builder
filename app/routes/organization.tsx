import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  MetaFunction,
} from '@remix-run/cloudflare';

import {
  Building2,
  CheckCircle2,
  Crown,
  LoaderCircle,
  Mail,
  Save,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';

import {
  AppShell,
} from '~/components/dashboard/AppShell';

import {
  useOrganization,
} from '~/lib/organizations/OrganizationContext';

import {
  getOrganizationMembers,
  type OrganizationMember,
  updateOrganizationName,
} from '~/lib/organizations/organization-management.client';

import type {
  OrganizationRole,
} from '~/lib/organizations/organization.client';


export const meta: MetaFunction = () => {
  return [
    {
      title:
        'Empresa & Equipe | 7System Builder',
    },
    {
      name:
        'description',

      content:
        'Gerencie sua empresa e equipe no 7System Builder.',
    },
  ];
};


/*
 * IMPORTANTE:
 *
 * useOrganization() não pode ser chamado
 * aqui no componente raiz porque o
 * OrganizationProvider fica dentro do
 * ProtectedRoute/AppShell.
 *
 * Por isso usamos um componente filho.
 */
export default function OrganizationRoute() {
  return (
    <AppShell>
      <OrganizationContent />
    </AppShell>
  );
}


function getRoleLabel(
  role: OrganizationRole,
): string {
  switch (role) {
    case 'owner':
      return 'Proprietário';

    case 'admin':
      return 'Administrador';

    case 'editor':
      return 'Editor';

    case 'viewer':
      return 'Visualizador';

    default:
      return role;
  }
}


function getRoleDescription(
  role: OrganizationRole,
): string {
  switch (role) {
    case 'owner':
      return 'Controle total da empresa.';

    case 'admin':
      return 'Gerencia empresa, equipe e projetos.';

    case 'editor':
      return 'Cria e edita projetos.';

    case 'viewer':
      return 'Possui acesso somente para visualização.';

    default:
      return '';
  }
}


function OrganizationContent() {
  const {
    organizations,
    activeOrganization,
    switchOrganization,
    refreshOrganizations,
  } =
    useOrganization();

  const [
    organizationName,
    setOrganizationName,
  ] =
    useState(
      activeOrganization.name,
    );

  const [
    members,
    setMembers,
  ] =
    useState<
      OrganizationMember[]
    >([]);

  const [
    loadingMembers,
    setLoadingMembers,
  ] =
    useState(true);

  const [
    switching,
    setSwitching,
  ] =
    useState(false);

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


  const canManage =
    activeOrganization.role ===
      'owner' ||
    activeOrganization.role ===
      'admin';


  /*
   * CARREGAR MEMBROS DA ORGANIZAÇÃO
   */
  useEffect(() => {
    let active = true;

    async function loadMembers() {
      try {
        setLoadingMembers(
          true,
        );

        setErrorMessage('');

        setOrganizationName(
          activeOrganization.name,
        );

        const result =
          await getOrganizationMembers(
            activeOrganization.id,
          );

        if (!active) {
          return;
        }

        setMembers(
          result,
        );
      } catch (error) {
        console.error(
          'Erro ao carregar equipe:',
          error,
        );

        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a equipe.',
        );
      } finally {
        if (active) {
          setLoadingMembers(
            false,
          );
        }
      }
    }

    void loadMembers();

    return () => {
      active = false;
    };
  }, [
    activeOrganization.id,
    activeOrganization.name,
  ]);


  const ownerCount =
    useMemo(
      () =>
        members.filter(
          (member) =>
            member.role ===
            'owner',
        ).length,

      [members],
    );


  async function handleOrganizationChange(
    organizationId: string,
  ) {
    if (
      organizationId ===
      activeOrganization.id
    ) {
      return;
    }

    setSwitching(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await switchOrganization(
        organizationId,
      );
    } catch (error) {
      console.error(
        'Erro ao trocar organização:',
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível trocar de organização.',
      );
    } finally {
      setSwitching(false);
    }
  }


  async function handleSaveOrganization(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      saving ||
      !canManage
    ) {
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateOrganizationName(
        activeOrganization.id,
        organizationName,
      );

      /*
       * Recarrega o OrganizationContext
       * para refletir o nome novo.
       */
      await refreshOrganizations();

      setSuccessMessage(
        'Dados da empresa atualizados com sucesso.',
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar empresa:',
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a empresa.',
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <div
      className="mx-auto w-full max-w-6xl p-8"
    >
      {/* CABEÇALHO */}
      <div
        className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
      >
        <div>
          <div
            className="text-sm font-semibold"
            style={{
              color:
                '#B88918',
            }}
          >
            ORGANIZAÇÃO
          </div>

          <h1
            className="mt-2 text-3xl font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Empresa & Equipe
          </h1>

          <p
            className="mt-2 text-sm"
            style={{
              color:
                '#64748B',
            }}
          >
            Gerencie sua organização
            e visualize os membros
            vinculados a ela.
          </p>
        </div>


        {/* TROCAR ORGANIZAÇÃO */}
        <div
          className="w-full lg:w-80"
        >
          <label
            htmlFor="organization"
            className="mb-2 block text-xs font-bold uppercase"
            style={{
              color:
                '#64748B',
            }}
          >
            Organização ativa
          </label>

          <div
            className="relative"
          >
            <Building2
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              style={{
                color:
                  '#94A3B8',
              }}
            />

            <select
              id="organization"
              value={
                activeOrganization.id
              }
              disabled={
                switching ||
                organizations.length <= 1
              }
              onChange={(
                event,
              ) => {
                void handleOrganizationChange(
                  event.target.value,
                );
              }}
              className="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm font-semibold outline-none disabled:cursor-not-allowed"
              style={{
                borderColor:
                  '#CBD5E1',

                color:
                  '#0B1739',
              }}
            >
              {organizations.map(
                (
                  organization,
                ) => (
                  <option
                    key={
                      organization.id
                    }
                    value={
                      organization.id
                    }
                  >
                    {
                      organization.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </div>


      {/* MENSAGENS */}
      {errorMessage && (
        <div
          className="mt-6 rounded-xl border p-4 text-sm"
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
          className="mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm"
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


      {/* RESUMO */}
      <div
        className="mt-8 grid gap-5 md:grid-cols-3"
      >
        <div
          className="rounded-2xl border bg-white p-5"
          style={{
            borderColor:
              '#E2E8F0',
          }}
        >
          <Building2
            size={24}
            style={{
              color:
                '#B88918',
            }}
          />

          <div
            className="mt-4 text-xs font-bold uppercase"
            style={{
              color:
                '#64748B',
            }}
          >
            Empresa
          </div>

          <div
            className="mt-1 truncate text-lg font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            {
              activeOrganization.name
            }
          </div>
        </div>


        <div
          className="rounded-2xl border bg-white p-5"
          style={{
            borderColor:
              '#E2E8F0',
          }}
        >
          <ShieldCheck
            size={24}
            style={{
              color:
                '#B88918',
            }}
          />

          <div
            className="mt-4 text-xs font-bold uppercase"
            style={{
              color:
                '#64748B',
            }}
          >
            Seu papel
          </div>

          <div
            className="mt-1 text-lg font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            {getRoleLabel(
              activeOrganization.role,
            )}
          </div>
        </div>


        <div
          className="rounded-2xl border bg-white p-5"
          style={{
            borderColor:
              '#E2E8F0',
          }}
        >
          <Users
            size={24}
            style={{
              color:
                '#B88918',
            }}
          />

          <div
            className="mt-4 text-xs font-bold uppercase"
            style={{
              color:
                '#64748B',
            }}
          >
            Membros
          </div>

          <div
            className="mt-1 text-lg font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            {members.length}
          </div>

          {ownerCount > 0 && (
            <div
              className="mt-1 text-xs"
              style={{
                color:
                  '#94A3B8',
              }}
            >
              {ownerCount}{' '}
              proprietário(s)
            </div>
          )}
        </div>
      </div>


      {/* DADOS DA EMPRESA */}
      <form
        onSubmit={
          handleSaveOrganization
        }
        className="mt-8 overflow-hidden rounded-2xl border bg-white"
        style={{
          borderColor:
            '#E2E8F0',
        }}
      >
        <div
          className="border-b p-6"
          style={{
            borderColor:
              '#E2E8F0',

            backgroundColor:
              '#F8FAFC',
          }}
        >
          <h2
            className="text-lg font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Dados da empresa
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color:
                '#64748B',
            }}
          >
            Informações da organização
            atualmente selecionada.
          </p>
        </div>


        <div
          className="grid gap-6 p-6 md:grid-cols-2"
        >
          <div>
            <label
              htmlFor="organizationName"
              className="mb-2 block text-sm font-semibold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              Nome da empresa
            </label>

            <input
              id="organizationName"
              type="text"
              minLength={2}
              maxLength={120}
              required
              disabled={
                !canManage
              }
              value={
                organizationName
              }
              onChange={(
                event,
              ) =>
                setOrganizationName(
                  event.target.value,
                )
              }
              className="h-12 w-full rounded-xl border px-4 text-sm outline-none disabled:cursor-not-allowed"
              style={{
                borderColor:
                  '#CBD5E1',

                backgroundColor:
                  canManage
                    ? '#FFFFFF'
                    : '#F8FAFC',

                color:
                  canManage
                    ? '#111827'
                    : '#64748B',
              }}
            />
          </div>


          <div>
            <label
              className="mb-2 block text-sm font-semibold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              Slug
            </label>

            <input
              type="text"
              readOnly
              value={
                activeOrganization.slug
              }
              className="h-12 w-full cursor-not-allowed rounded-xl border px-4 text-sm"
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


          <div>
            <label
              className="mb-2 block text-sm font-semibold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              Status
            </label>

            <div
              className="flex h-12 items-center gap-2 rounded-xl border px-4"
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
                size={18}
              />

              <span
                className="text-sm font-semibold"
              >
                Ativa
              </span>
            </div>
          </div>


          <div>
            <label
              className="mb-2 block text-sm font-semibold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              Sua permissão
            </label>

            <div
              className="rounded-xl border p-3"
              style={{
                borderColor:
                  '#E2E8F0',

                backgroundColor:
                  '#F8FAFC',
              }}
            >
              <div
                className="flex items-center gap-2 text-sm font-bold"
                style={{
                  color:
                    '#0B1739',
                }}
              >
                {activeOrganization.role ===
                  'owner' && (
                  <Crown
                    size={17}
                    style={{
                      color:
                        '#B88918',
                    }}
                  />
                )}

                {getRoleLabel(
                  activeOrganization.role,
                )}
              </div>

              <div
                className="mt-1 text-xs"
                style={{
                  color:
                    '#64748B',
                }}
              >
                {getRoleDescription(
                  activeOrganization.role,
                )}
              </div>
            </div>
          </div>
        </div>


        {canManage && (
          <div
            className="flex justify-end border-t p-6"
            style={{
              borderColor:
                '#E2E8F0',
            }}
          >
            <button
              type="submit"
              disabled={
                saving
              }
              className="flex h-12 items-center gap-2 rounded-xl px-6 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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

                  Salvar empresa
                </>
              )}
            </button>
          </div>
        )}
      </form>


      {/* EQUIPE */}
      <div
        className="mt-8 overflow-hidden rounded-2xl border bg-white"
        style={{
          borderColor:
            '#E2E8F0',
        }}
      >
        <div
          className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center"
          style={{
            borderColor:
              '#E2E8F0',

            backgroundColor:
              '#F8FAFC',
          }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              Equipe
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color:
                  '#64748B',
              }}
            >
              Pessoas com acesso a esta
              organização.
            </p>
          </div>


          {canManage && (
            <button
              type="button"
              disabled
              title="Será habilitado na etapa 2.7.7F"
              className="flex h-11 cursor-not-allowed items-center gap-2 rounded-xl border px-4 text-sm font-semibold opacity-60"
              style={{
                borderColor:
                  '#D4A72C',

                color:
                  '#B88918',
              }}
            >
              <UserPlus
                size={18}
              />

              Convidar usuário
            </button>
          )}
        </div>


        {loadingMembers ? (
          <div
            className="flex min-h-[220px] items-center justify-center"
          >
            <div
              className="text-center"
            >
              <LoaderCircle
                size={32}
                className="mx-auto animate-spin"
                style={{
                  color:
                    '#D4A72C',
                }}
              />

              <p
                className="mt-3 text-sm"
                style={{
                  color:
                    '#64748B',
                }}
              >
                Carregando equipe...
              </p>
            </div>
          </div>
        ) : members.length ===
          0 ? (
          <div
            className="p-10 text-center"
          >
            <Users
              size={36}
              className="mx-auto"
              style={{
                color:
                  '#94A3B8',
              }}
            />

            <p
              className="mt-4 text-sm"
              style={{
                color:
                  '#64748B',
              }}
            >
              Nenhum membro encontrado.
            </p>
          </div>
        ) : (
          <div
            className="overflow-x-auto"
          >
            <table
              className="w-full"
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      '#F8FAFC',
                  }}
                >
                  <th
                    className="px-6 py-4 text-left text-xs font-bold uppercase"
                    style={{
                      color:
                        '#64748B',
                    }}
                  >
                    Usuário
                  </th>

                  <th
                    className="px-6 py-4 text-left text-xs font-bold uppercase"
                    style={{
                      color:
                        '#64748B',
                    }}
                  >
                    Papel
                  </th>

                  <th
                    className="px-6 py-4 text-left text-xs font-bold uppercase"
                    style={{
                      color:
                        '#64748B',
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.map(
                  (
                    member,
                  ) => (
                    <tr
                      key={
                        member.userId
                      }
                      className="border-t"
                      style={{
                        borderColor:
                          '#E2E8F0',
                      }}
                    >
                      <td
                        className="px-6 py-4"
                      >
                        <div
                          className="font-semibold"
                          style={{
                            color:
                              '#0B1739',
                          }}
                        >
                          {
                            member.fullName
                          }
                        </div>

                        <div
                          className="mt-1 flex items-center gap-1.5 text-xs"
                          style={{
                            color:
                              '#64748B',
                          }}
                        >
                          <Mail
                            size={13}
                          />

                          {
                            member.email ||
                            'E-mail não disponível'
                          }
                        </div>
                      </td>

                      <td
                        className="px-6 py-4"
                      >
                        <div
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              member.role ===
                              'owner'
                                ? 'rgba(212,167,44,0.14)'
                                : '#F1F5F9',

                            color:
                              member.role ===
                              'owner'
                                ? '#926D12'
                                : '#475569',
                          }}
                        >
                          {member.role ===
                            'owner' && (
                            <Crown
                              size={13}
                            />
                          )}

                          {getRoleLabel(
                            member.role,
                          )}
                        </div>
                      </td>

                      <td
                        className="px-6 py-4"
                      >
                        <span
                          className="inline-flex items-center gap-2 text-sm font-semibold"
                          style={{
                            color:
                              '#166534',
                          }}
                        >
                          <CheckCircle2
                            size={16}
                          />

                          Ativo
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* PRÓXIMA ETAPA */}
      {canManage && (
        <div
          className="mt-6 rounded-xl border p-4 text-sm"
          style={{
            borderColor:
              'rgba(212,167,44,0.28)',

            backgroundColor:
              'rgba(212,167,44,0.06)',

            color:
              '#64748B',
          }}
        >
          <strong
            style={{
              color:
                '#0B1739',
            }}
          >
            Gestão de usuários:
          </strong>{' '}
          o envio de convites e a adição
          de novos membros será habilitado
          na próxima etapa.
        </div>
      )}
    </div>
  );
}