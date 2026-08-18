import { useEffect, useMemo, useState, } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useNavigate, useSearchParams, } from '@remix-run/react';

import {
  ArrowLeft,
  Building2,
  Check,
  Globe2,
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Sparkles,
  Store,
  Wrench,
} from 'lucide-react';

import { AppShell } from '~/components/dashboard/AppShell';
import { getProjectById, saveProject, } from '~/lib/projects/project-storage.client';
import { getTemplateById, } from '~/lib/templates/template-data';

export const meta: MetaFunction = () => {
  return [
    { title: 'Novo Projeto | 7System Builder' },
    {
      name: 'description',
      content: 'Crie um novo projeto utilizando inteligência artificial',
    },
  ];
};

type ProjectType =
  | 'saas'
  | 'ecommerce'
  | 'site'
  | 'catalog'
  | 'pdv'
  | 'custom';

interface ProjectOption {
  id: ProjectType;
  title: string;
  description: string;
  icon: typeof Building2;
}

const projectTypes: ProjectOption[] = [
  {
    id: 'saas',
    title: 'SaaS',
    description: 'Sistema web com usuários, empresas, permissões e painel.',
    icon: Building2,
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    description: 'Loja virtual com produtos, carrinho e pedidos.',
    icon: ShoppingCart,
  },
  {
    id: 'site',
    title: 'Site',
    description: 'Site institucional, landing page ou apresentação comercial.',
    icon: Globe2,
  },
  {
    id: 'catalog',
    title: 'Catálogo',
    description: 'Catálogo online de produtos e serviços.',
    icon: PackageSearch,
  },
  {
    id: 'pdv',
    title: 'PDV',
    description: 'Sistema de vendas, caixa, produtos e estoque.',
    icon: Store,
  },
  {
    id: 'custom',
    title: 'Personalizado',
    description: 'Projeto totalmente personalizado.',
    icon: Wrench,
  },
];

const templateInstructions: Record<ProjectType, string> = {
  saas: `
Crie uma arquitetura SaaS profissional.
Considere:
- autenticação;
- usuários;
- empresas;
- multiempresa quando aplicável;
- perfis e permissões;
- dashboard;
- configurações;
- banco estruturado;
- RLS quando usar Supabase;
- componentes reutilizáveis;
- interface responsiva.
`,

  ecommerce: `
Crie uma arquitetura profissional de e-commerce.
Considere:
- produtos;
- categorias;
- imagens;
- estoque;
- carrinho;
- checkout;
- clientes;
- pedidos;
- formas de pagamento;
- painel administrativo;
- interface responsiva.
`,

  site: `
Crie um site profissional e responsivo.
Considere:
- página inicial;
- apresentação dos serviços;
- benefícios;
- chamadas para ação;
- contato;
- SEO básico;
- boa experiência mobile;
- identidade visual consistente.
`,

  catalog: `
Crie um catálogo online profissional.
Considere:
- categorias;
- produtos;
- imagens;
- busca;
- filtros;
- página de detalhes;
- botão de contato ou WhatsApp;
- painel de gerenciamento;
- layout responsivo.
`,

  pdv: `
Crie um sistema de PDV profissional.
Considere:
- produtos;
- clientes;
- vendas;
- caixa;
- estoque;
- formas de pagamento;
- histórico;
- relatórios;
- usuários e permissões;
- dashboard.
`,

  custom: `
Analise cuidadosamente os requisitos fornecidos.
Defina a melhor arquitetura para o projeto.
Organize o sistema em módulos reutilizáveis e mantenha o código escalável.
`,
};

export default function NewProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('id');

  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('saas');
  const [description, setDescription] = useState('');
  const [useSupabase, setUseSupabase] = useState(true);
  const [responsive, setResponsive] = useState(true);

  useEffect(() => {
  if (!editingId) {
    return;
  }

  const project = getProjectById(editingId);

  if (!project) {
    return;
  }

  setProjectName(project.name);
  setProjectType(project.type);
  setDescription(project.description);
  setUseSupabase(project.useSupabase);
  setResponsive(project.responsive);
}, [editingId]);

  const selectedProject = useMemo(
    () => projectTypes.find((item) => item.id === projectType),
    [projectType],
  );

  const canCreate =
    projectName.trim().length >= 2 &&
    description.trim().length >= 10;

  function buildPrompt() {
    return `
Você está iniciando um novo projeto no 7System Builder.

NOME DO PROJETO:
${projectName.trim()}

TIPO DO PROJETO:
${selectedProject?.title ?? projectType}

DESCRIÇÃO E REQUISITOS:
${description.trim()}

CONFIGURAÇÕES:
- Supabase: ${useSupabase ? 'Sim' : 'Não obrigatório'}
- Responsivo: ${responsive ? 'Sim' : 'Não obrigatório'}

DIRETRIZES DO TEMPLATE:
${templateInstructions[projectType]}

PADRÕES OBRIGATÓRIOS:
- Utilize React e TypeScript.
- Utilize componentes reutilizáveis.
- Organize o código de maneira profissional.
- Evite duplicação de código.
- Faça validação de formulários.
- Implemente tratamento de erros.
- Utilize uma interface moderna.
- Mantenha boa experiência em desktop e celular.
${
  useSupabase
    ? '- Quando houver banco de dados, utilize Supabase e aplique políticas RLS adequadas.'
    : ''
}

IMPORTANTE:
Antes de começar a escrever código:
1. analise todos os requisitos;
2. defina as telas necessárias;
3. defina os módulos;
4. defina a estrutura de dados;
5. planeje a arquitetura;
6. depois implemente o projeto.

Crie o projeto completo chamado "${projectName.trim()}".
`.trim();
  }

    function handleCreate() {
    if (!canCreate) {
      return;
    }

    const prompt = buildPrompt();

    const project = saveProject({
      id: editingId ?? undefined,
      name: projectName,
      type: projectType,
      description,

      useSupabase,
      responsive,

      status: 'building',

      lastPrompt: prompt,
    });

    navigate(
      `/builder?projectId=${encodeURIComponent(
        project.id,
      )}&prompt=${encodeURIComponent(prompt)}`,
    );
  }

  return (
    <AppShell>
      <div
        className="min-h-screen"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <header
          className="flex min-h-20 items-center justify-between border-b px-8 py-4"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mb-2 flex items-center gap-2 text-sm"
              style={{ color: '#64748B' }}
            >
              <ArrowLeft size={16} />
              Voltar ao Dashboard
            </button>

            <h1
              className="text-2xl font-bold"
              style={{ color: '#0B1739' }}
            >
              {editingId ? 'Editar Projeto' : 'Novo Projeto'}
            </h1>

            <p
              className="mt-1 text-sm"
              style={{ color: '#64748B' }}
            >
              Informe o que deseja criar e o Builder preparará o projeto.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-6xl p-8">
          <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <section
                className="rounded-2xl border p-7"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                }}
              >
                <div className="mb-6">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: '#0B1739' }}
                  >
                    Informações do projeto
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: '#64748B' }}
                  >
                    Comece informando o nome e o objetivo da aplicação.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="projectName"
                    className="mb-2 block text-sm font-semibold"
                    style={{ color: '#334155' }}
                  >
                    Nome do projeto
                  </label>

                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(event) =>
                      setProjectName(event.target.value)
                    }
                    placeholder="Ex.: Arena Flow"
                    className="w-full rounded-xl border px-4 py-3 outline-none transition"
                    style={{
                      borderColor: '#CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0B1739',
                    }}
                  />
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold"
                    style={{ color: '#334155' }}
                  >
                    Descreva o sistema
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Ex.: Crie um sistema SaaS para academias com cadastro de alunos, contratos, mensalidades, pagamentos..."
                    rows={8}
                    className="w-full resize-y rounded-xl border px-4 py-3 outline-none transition"
                    style={{
                      borderColor: '#CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0B1739',
                    }}
                  />

                  <div
                    className="mt-2 text-right text-xs"
                    style={{ color: '#94A3B8' }}
                  >
                    {description.length} caracteres
                  </div>
                </div>
              </section>

              <section
                className="rounded-2xl border p-7"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                }}
              >
                <div className="mb-6">
                  <h2
                    className="text-lg font-bold"
                    style={{ color: '#0B1739' }}
                  >
                    Tipo de projeto
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: '#64748B' }}
                  >
                    Isso ajuda a IA a escolher a estrutura inicial.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {projectTypes.map((item) => {
                    const Icon = item.icon;
                    const selected = projectType === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setProjectType(item.id)}
                        className="relative rounded-xl border p-5 text-left transition-all"
                        style={{
                          borderColor: selected
                            ? '#D4A72C'
                            : '#E2E8F0',
                          backgroundColor: selected
                            ? 'rgba(212,167,44,0.07)'
                            : '#FFFFFF',
                        }}
                      >
                        {selected && (
                          <div
                            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: '#D4A72C',
                              color: '#0B1739',
                            }}
                          >
                            <Check size={14} />
                          </div>
                        )}

                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: selected
                              ? 'rgba(212,167,44,0.16)'
                              : '#F1F5F9',
                            color: selected
                              ? '#B88918'
                              : '#475569',
                          }}
                        >
                          <Icon size={20} />
                        </div>

                        <h3
                          className="mt-4 font-bold"
                          style={{ color: '#0B1739' }}
                        >
                          {item.title}
                        </h3>

                        <p
                          className="mt-2 text-sm leading-5"
                          style={{ color: '#64748B' }}
                        >
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section
                className="rounded-2xl border p-7"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                }}
              >
                <h2
                  className="text-lg font-bold"
                  style={{ color: '#0B1739' }}
                >
                  Configurações
                </h2>

                <div className="mt-6 space-y-4">
                  <label
                    className="flex cursor-pointer items-center justify-between rounded-xl border p-4"
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: '#0B1739' }}
                      >
                        Usar Supabase
                      </div>

                      <div
                        className="mt-1 text-sm"
                        style={{ color: '#64748B' }}
                      >
                        Banco de dados, autenticação e storage.
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={useSupabase}
                      onChange={(event) =>
                        setUseSupabase(event.target.checked)
                      }
                      className="h-5 w-5"
                    />
                  </label>

                  <label
                    className="flex cursor-pointer items-center justify-between rounded-xl border p-4"
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: '#0B1739' }}
                      >
                        Layout responsivo
                      </div>

                      <div
                        className="mt-1 text-sm"
                        style={{ color: '#64748B' }}
                      >
                        Adaptar para celular, tablet e computador.
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={responsive}
                      onChange={(event) =>
                        setResponsive(event.target.checked)
                      }
                      className="h-5 w-5"
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside>
              <div
                className="sticky top-8 rounded-2xl border p-6"
                style={{
                  backgroundColor: '#0B1739',
                  borderColor: '#142A5C',
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'rgba(212,167,44,0.15)',
                    color: '#F1C75B',
                  }}
                >
                  <Sparkles size={23} />
                </div>

                <h2
                  className="mt-5 text-xl font-bold"
                  style={{ color: '#FFFFFF' }}
                >
                  Criar com IA
                </h2>

                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: '#CBD5E1' }}
                >
                  O 7System Builder transformará essas informações em
                  um briefing técnico para iniciar a aplicação.
                </p>

                <div
                  className="mt-6 rounded-xl p-4"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    className="text-xs font-semibold"
                    style={{ color: '#94A3B8' }}
                  >
                    PROJETO
                  </div>

                  <div
                    className="mt-1 font-semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    {projectName.trim() || 'Sem nome'}
                  </div>

                  <div
                    className="mt-4 text-xs font-semibold"
                    style={{ color: '#94A3B8' }}
                  >
                    TIPO
                  </div>

                  <div
                    className="mt-1"
                    style={{ color: '#F1C75B' }}
                  >
                    {selectedProject?.title}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canCreate}
                  onClick={handleCreate}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: '#D4A72C',
                    color: '#0B1739',
                  }}
                >
                  <Sparkles size={19} />

                  {editingId
                  ? 'Salvar e abrir com IA'
                  : 'Criar com IA'}
                </button>

                {!canCreate && (
                  <p
                    className="mt-3 text-center text-xs"
                    style={{ color: '#94A3B8' }}
                  >
                    Informe um nome e uma descrição do projeto.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
