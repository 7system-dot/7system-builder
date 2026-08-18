import {
  useMemo,
  useState,
} from 'react';

import type { MetaFunction } from '@remix-run/cloudflare';
import { useNavigate } from '@remix-run/react';

import {
  ArrowRight,
  Building2,
  Dumbbell,
  Globe2,
  LayoutTemplate,
  PackageSearch,
  Search,
  ShoppingCart,
  Store,
  Wrench,
} from 'lucide-react';

import { AppShell } from '~/components/dashboard/AppShell';

import {
  templates,
  type TemplateCategory,
} from '~/lib/templates/template-data';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Templates | 7System Builder',
    },
    {
      name: 'description',
      content:
        'Templates profissionais do 7System Builder',
    },
  ];
};

type CategoryFilter =
  | 'Todos'
  | TemplateCategory;

const categories: CategoryFilter[] = [
  'Todos',
  'SaaS',
  'Comércio',
  'Sites',
  'Personalizado',
];

const templateIcons = {
  building: Building2,
  shopping: ShoppingCart,
  globe: Globe2,
  catalog: PackageSearch,
  store: Store,
  academy: Dumbbell,
  custom: Wrench,
};

export default function Templates() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const [category, setCategory] =
    useState<CategoryFilter>('Todos');

  const filteredTemplates = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory =
        category === 'Todos' ||
        template.category === category;

      const matchesSearch =
        !normalized ||
        template.name
          .toLowerCase()
          .includes(normalized) ||
        template.description
          .toLowerCase()
          .includes(normalized);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  function useTemplate(templateId: string) {
    navigate(
      `/new-project?template=${encodeURIComponent(
        templateId,
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
          className="border-b px-8 py-6"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor:
                  'rgba(212,167,44,0.12)',
                color: '#B88918',
              }}
            >
              <LayoutTemplate size={22} />
            </div>

            <div>
              <h1
                className="text-2xl font-bold"
                style={{
                  color: '#0B1739',
                }}
              >
                Templates
              </h1>

              <p
                className="mt-1 text-sm"
                style={{
                  color: '#64748B',
                }}
              >
                Comece seu projeto usando uma
                estrutura profissional pronta.
              </p>
            </div>
          </div>
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
                  placeholder="Pesquisar templates..."
                  className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none"
                  style={{
                    borderColor: '#CBD5E1',
                    color: '#0B1739',
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((item) => {
                  const active =
                    category === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setCategory(item)
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
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="mt-6 text-sm"
            style={{
              color: '#64748B',
            }}
          >
            {filteredTemplates.length}{' '}
            {filteredTemplates.length === 1
              ? 'template disponível'
              : 'templates disponíveis'}
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map(
              (template) => {
                const Icon =
                  templateIcons[template.icon];

                return (
                  <article
                    key={template.id}
                    className="flex flex-col overflow-hidden rounded-2xl border"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor:
                              'rgba(212,167,44,0.12)',
                            color: '#B88918',
                          }}
                        >
                          <Icon size={24} />
                        </div>

                        {template.badge && (
                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold"
                            style={{
                              backgroundColor:
                                'rgba(212,167,44,0.12)',
                              color: '#926A12',
                            }}
                          >
                            {template.badge}
                          </span>
                        )}
                      </div>

                      <div
                        className="mt-5 text-xs font-bold uppercase tracking-wide"
                        style={{
                          color: '#B88918',
                        }}
                      >
                        {template.category}
                      </div>

                      <h2
                        className="mt-2 text-xl font-bold"
                        style={{
                          color: '#0B1739',
                        }}
                      >
                        {template.name}
                      </h2>

                      <p
                        className="mt-3 text-sm leading-6"
                        style={{
                          color: '#64748B',
                        }}
                      >
                        {template.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {template.features
                          .slice(0, 6)
                          .map((feature) => (
                            <span
                              key={feature}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium"
                              style={{
                                backgroundColor:
                                  '#F1F5F9',
                                color: '#475569',
                              }}
                            >
                              {feature}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div
                      className="border-t p-4"
                      style={{
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          useTemplate(template.id)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition"
                        style={{
                          backgroundColor:
                            '#D4A72C',
                          color: '#0B1739',
                        }}
                      >
                        Usar este template

                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>

          {filteredTemplates.length === 0 && (
            <div
              className="mt-6 rounded-2xl border border-dashed p-12 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
              }}
            >
              <LayoutTemplate
                size={35}
                className="mx-auto"
                style={{
                  color: '#94A3B8',
                }}
              />

              <h2
                className="mt-4 text-lg font-bold"
                style={{
                  color: '#0B1739',
                }}
              >
                Nenhum template encontrado
              </h2>

              <p
                className="mt-2 text-sm"
                style={{
                  color: '#64748B',
                }}
              >
                Altere a busca ou selecione outra
                categoria.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
