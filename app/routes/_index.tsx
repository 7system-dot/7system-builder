import { useEffect, useState, } from 'react';
import { getProjects, type ProjectRecord,} from '~/lib/projects/project-storage.client';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';

import {
  Bot,
  FolderKanban,
  LayoutTemplate,
  PlusCircle,
  Rocket,
  Sparkles,
} from 'lucide-react';

import { AppShell } from '~/components/dashboard/AppShell';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard | 7System Builder' },
    {
      name: 'description',
      content: 'Painel principal do 7System Builder',
    },
  ];
};

export default function Dashboard() {
    const [projects, setProjects] =
    useState<ProjectRecord[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const stats = [
    {
      title: 'Projetos',
      value: String(projects.length),
      icon: FolderKanban,
    },
    {
      title: 'Em desenvolvimento',
      value: String(
        projects.filter(
          (project) => project.status === 'building',
        ).length,
      ),
      icon: Sparkles,
    },
    {
      title: 'Publicados',
      value: String(
        projects.filter(
          (project) => project.status === 'published',
        ).length,
      ),
      icon: Rocket,
    },
    {
      title: 'Templates',
      value: '0',
      icon: LayoutTemplate,
    },
  ];
  
  return (
    <AppShell>
      <div className="min-h-screen">
        <header
          className="flex h-20 items-center justify-between border-b px-8"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
          }}
        >
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: '#0B1739' }}
            >
              Dashboard
            </h1>

            <p
              className="mt-1 text-sm"
              style={{ color: '#64748B' }}
            >
              Gerencie seus projetos e aplicações.
            </p>
          </div>

          <Link
            to="/new-project"
            className="flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all"
            style={{
              backgroundColor: '#D4A72C',
              color: '#0B1739',
            }}
          >
            <PlusCircle size={18} />
            Criar projeto
          </Link>
        </header>

        <div className="p-8">
          <section>
            <h2
              className="text-sm font-semibold"
              style={{ color: '#64748B' }}
            >
              VISÃO GERAL
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border p-6"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className="text-sm"
                          style={{ color: '#64748B' }}
                        >
                          {stat.title}
                        </p>

                        <p
                          className="mt-3 text-3xl font-bold"
                          style={{ color: '#0B1739' }}
                        >
                          {stat.value}
                        </p>
                      </div>

                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: 'rgba(212,167,44,0.12)',
                          color: '#B88918',
                        }}
                      >
                        <Icon size={21} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-8">
            <div
              className="rounded-2xl border p-8"
              style={{
                backgroundColor: '#0B1739',
                borderColor: '#142A5C',
              }}
            >
              <div className="max-w-2xl">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'rgba(212,167,44,0.16)',
                    color: '#F1C75B',
                  }}
                >
                  <Bot size={24} />
                </div>

                <h2
                  className="text-2xl font-bold"
                  style={{ color: '#FFFFFF' }}
                >
                  Crie sua próxima aplicação com IA
                </h2>

                <p
                  className="mt-3 max-w-xl text-sm leading-6"
                  style={{ color: '#CBD5E1' }}
                >
                  Descreva o sistema que deseja criar e utilize o
                  7System Builder para gerar, editar e visualizar sua
                  aplicação.
                </p>

                <Link
                  to="/builder"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: '#D4A72C',
                    color: '#0B1739',
                  }}
                >
                  <Sparkles size={18} />

                  Abrir Builder IA
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div
              className="rounded-2xl border p-8"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: '#0B1739' }}
                  >
                    Projetos recentes
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: '#64748B' }}
                  >
                    Seus projetos aparecerão aqui.
                  </p>
                </div>
              </div>

              <div
                className="mt-8 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed"
                style={{
                  borderColor: '#CBD5E1',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <FolderKanban
                  size={34}
                  style={{ color: '#94A3B8' }}
                />

                <p
                  className="mt-4 font-medium"
                  style={{ color: '#475569' }}
                >
                  Nenhum projeto criado
                </p>

                <p
                  className="mt-1 text-sm"
                  style={{ color: '#94A3B8' }}
                >
                  Abra o Builder IA para criar seu primeiro projeto.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
