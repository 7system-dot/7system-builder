import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { MetaFunction } from '@remix-run/cloudflare';

import {
  useNavigate,
} from '@remix-run/react';

import {
  Bot,
  CalendarDays,
  ExternalLink,
  FolderKanban,
  LayoutGrid,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react';

import { AppShell } from '~/components/dashboard/AppShell';

import {
  deleteProject,
  getProjects,
  migrateLegacyProjectsToSupabase,
  projectStatusLabels,
  projectTypeLabels,
  type ProjectRecord,
  type ProjectStatus,
} from '~/lib/projects/project-storage.client';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Meus Projetos | 7System Builder',
    },
    {
      name: 'description',
      content:
        'Gerencie seus projetos no 7System Builder',
    },
  ];
};

type FilterStatus = 'all' | ProjectStatus;

const statusOptions: {
  value: FilterStatus;
  label: string;
}[] = [
  {
    value: 'all',
    label: 'Todos',
  },
  {
    value: 'draft',
    label: 'Rascunhos',
  },
  {
    value: 'building',
    label: 'Em desenvolvimento',
  },
  {
    value: 'published',
    label: 'Publicados',
  },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState<ProjectRecord[]>([]);

  const [search, setSearch] = useState('');

  const [status, setStatus] =
    useState<FilterStatus>('all');

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        project.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        project.description
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        status === 'all' ||
        project.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);

  function handleDelete(project: ProjectRecord) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o projeto "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    deleteProject(project.id);

    setProjects(getProjects());
  }

  function handleEdit(project: ProjectRecord) {
    navigate(
      `/new-project?id=${encodeURIComponent(
        project.id,
      )}`,
    );
  }

  function handleOpen(project: ProjectRecord) {
    if (project.lastPrompt) {
      navigate(
        `/builder?projectId=${encodeURIComponent(
          project.id,
        )}&prompt=${encodeURIComponent(
          project.lastPrompt,
        )}`,
      );

      return;
    }

    navigate(
      `/builder?projectId=${encodeURIComponent(
        project.id,
      )}`,
    );
  }

  return (
    <AppShell>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: '#F8FAFC',
        }}
      >
        <header
          className="flex min-h-20 items-center justify-between border-b px-8 py-4"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
          }}
        >
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: '#0B1739',
              }}
            >
              Meus Projetos
            </h1>

            <p
              className="mt-1 text-sm"
              style={{
                color: '#64748B',
              }}
            >
              Gerencie as aplicações criadas no
              7System Builder.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/new-project')
            }
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            style={{
              backgroundColor: '#D4A72C',
              color: '#0B1739',
            }}
          >
            <PlusCircle size={18} />

            Novo Projeto
          </button>
        </header>

        <div className="p-8">
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-xl flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: '#94A3B8',
                  }}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Pesquisar projetos..."
                  className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none"
                  style={{
                    borderColor: '#CBD5E1',
                    color: '#0B1739',
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const active =
                    status === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setStatus(option.value)
                      }
                      className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                      style={{
                        backgroundColor: active
                          ? '#0B1739'
                          : '#F1F5F9',

                        color: active
                          ? '#FFFFFF'
                          : '#475569',
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div
              className="flex items-center gap-2 text-sm"
              style={{
                color: '#64748B',
              }}
            >
              <LayoutGrid size={17} />

              {filteredProjects.length}{' '}
              {filteredProjects.length === 1
                ? 'projeto'
                : 'projetos'}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div
              className="mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center"
              style={{
                borderColor: '#CBD5E1',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor:
                    'rgba(212,167,44,0.12)',
                  color: '#B88918',
                }}
              >
                <FolderKanban size={30} />
              </div>

              <h2
                className="mt-5 text-xl font-bold"
                style={{
                  color: '#0B1739',
                }}
              >
                Nenhum projeto encontrado
              </h2>

              <p
                className="mt-2 max-w-md text-sm leading-6"
                style={{
                  color: '#64748B',
                }}
              >
                Crie seu primeiro projeto e ele
                aparecerá automaticamente aqui.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate('/new-project')
                }
                className="mt-6 flex items-center gap-2 rounded-xl px-5 py-3 font-bold"
                style={{
                  backgroundColor: '#D4A72C',
                  color: '#0B1739',
                }}
              >
                <PlusCircle size={18} />

                Criar primeiro projeto
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map(
                (project) => (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-2xl border"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor:
                              'rgba(212,167,44,0.12)',
                            color: '#B88918',
                          }}
                        >
                          <Bot size={21} />
                        </div>

                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              project.status ===
                              'published'
                                ? '#DCFCE7'
                                : project.status ===
                                    'building'
                                  ? '#FEF3C7'
                                  : '#F1F5F9',

                            color:
                              project.status ===
                              'published'
                                ? '#166534'
                                : project.status ===
                                    'building'
                                  ? '#92400E'
                                  : '#475569',
                          }}
                        >
                          {
                            projectStatusLabels[
                              project.status
                            ]
                          }
                        </span>
                      </div>

                      <h2
                        className="mt-5 truncate text-lg font-bold"
                        style={{
                          color: '#0B1739',
                        }}
                      >
                        {project.name}
                      </h2>

                      <div
                        className="mt-1 text-sm font-semibold"
                        style={{
                          color: '#B88918',
                        }}
                      >
                        {
                          projectTypeLabels[
                            project.type
                          ]
                        }
                      </div>

                      <p
                        className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5"
                        style={{
                          color: '#64748B',
                        }}
                      >
                        {project.description}
                      </p>

                      <div
                        className="mt-5 flex items-center gap-2 border-t pt-4 text-xs"
                        style={{
                          borderColor: '#F1F5F9',
                          color: '#94A3B8',
                        }}
                      >
                        <CalendarDays size={14} />

                        Atualizado em{' '}
                        {formatDate(
                          project.updatedAt,
                        )}
                      </div>
                    </div>

                    <div
                      className="flex border-t"
                      style={{
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleOpen(project)
                        }
                        className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-bold"
                        style={{
                          color: '#0B1739',
                        }}
                      >
                        <ExternalLink size={16} />

                        Abrir
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(project)
                        }
                        className="flex items-center justify-center border-l px-4 py-3"
                        style={{
                          borderColor: '#E2E8F0',
                          color: '#64748B',
                        }}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(project)
                        }
                        className="flex items-center justify-center border-l px-4 py-3"
                        style={{
                          borderColor: '#E2E8F0',
                          color: '#DC2626',
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
