export type TemplateProjectType =
  | 'saas'
  | 'ecommerce'
  | 'site'
  | 'catalog'
  | 'pdv'
  | 'custom';

export type TemplateIcon =
  | 'building'
  | 'shopping'
  | 'globe'
  | 'catalog'
  | 'store'
  | 'academy'
  | 'custom';

export type TemplateCategory =
  | 'SaaS'
  | 'Comércio'
  | 'Sites'
  | 'Personalizado';

export interface BuilderTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  projectType: TemplateProjectType;
  icon: TemplateIcon;
  badge?: string;
  features: string[];
  prompt: string;
}

export const templates: BuilderTemplate[] = [
  {
    id: 'saas-commercial',
    name: 'SaaS Gestão Comercial',
    description:
      'Sistema completo para empresas com clientes, produtos, vendas, estoque, financeiro e usuários.',
    category: 'SaaS',
    projectType: 'saas',
    icon: 'building',
    badge: 'Completo',
    features: [
      'Dashboard',
      'Clientes',
      'Produtos',
      'Vendas',
      'Estoque',
      'Financeiro',
      'Usuários e permissões',
      'Multiempresa',
    ],
    prompt: `
Crie um sistema SaaS profissional de gestão comercial.

O sistema deve possuir:

- Dashboard com indicadores principais;
- cadastro de empresas;
- cadastro de clientes;
- cadastro de fornecedores;
- cadastro de produtos e serviços;
- categorias de produtos;
- controle de estoque;
- movimentações de estoque;
- vendas;
- orçamentos;
- pedidos;
- contas a pagar;
- contas a receber;
- caixa;
- formas de pagamento;
- relatórios;
- usuários;
- perfis;
- permissões;
- configurações da empresa.

O sistema deve estar preparado para funcionar como SaaS multiempresa.

Cada empresa deve visualizar somente os próprios dados.

Crie uma interface moderna com menu lateral, dashboard e telas administrativas profissionais.
`.trim(),
  },

  {
    id: 'ecommerce-professional',
    name: 'E-commerce Profissional',
    description:
      'Loja virtual completa com catálogo, carrinho, checkout, pedidos e administração.',
    category: 'Comércio',
    projectType: 'ecommerce',
    icon: 'shopping',
    badge: 'Popular',
    features: [
      'Produtos',
      'Categorias',
      'Carrinho',
      'Checkout',
      'Clientes',
      'Pedidos',
      'Estoque',
      'Administração',
    ],
    prompt: `
Crie um e-commerce profissional e responsivo.

Área pública:

- página inicial;
- banners;
- categorias;
- produtos em destaque;
- promoções;
- busca;
- filtros;
- página de produto;
- galeria de imagens;
- carrinho;
- checkout;
- cadastro e login de clientes;
- acompanhamento de pedidos;
- página de contato.

Área administrativa:

- dashboard;
- produtos;
- categorias;
- estoque;
- clientes;
- pedidos;
- cupons;
- banners;
- configurações;
- relatórios.

Prepare a arquitetura para futura integração de pagamentos online e Pix.

A interface deve funcionar perfeitamente em computador, tablet e celular.
`.trim(),
  },

  {
    id: 'institutional-site',
    name: 'Site Institucional',
    description:
      'Site profissional para empresas, serviços e apresentação comercial.',
    category: 'Sites',
    projectType: 'site',
    icon: 'globe',
    features: [
      'Página inicial',
      'Sobre',
      'Serviços',
      'Benefícios',
      'Contato',
      'WhatsApp',
      'SEO',
      'Responsivo',
    ],
    prompt: `
Crie um site institucional moderno e profissional.

Estrutura sugerida:

- cabeçalho;
- menu;
- seção principal;
- chamada para ação;
- apresentação da empresa;
- serviços;
- benefícios;
- diferenciais;
- depoimentos;
- perguntas frequentes;
- formulário de contato;
- botão do WhatsApp;
- rodapé completo.

O site deve ter ótima apresentação visual, carregamento rápido e excelente experiência mobile.

Prepare também estrutura básica para SEO.
`.trim(),
  },

  {
    id: 'online-catalog',
    name: 'Catálogo Online',
    description:
      'Catálogo digital para divulgação de produtos e recebimento de pedidos.',
    category: 'Comércio',
    projectType: 'catalog',
    icon: 'catalog',
    features: [
      'Produtos',
      'Categorias',
      'Busca',
      'Filtros',
      'Fotos',
      'WhatsApp',
      'Pedidos',
      'Painel administrativo',
    ],
    prompt: `
Crie um catálogo online profissional.

Área pública:

- página inicial;
- categorias;
- produtos;
- busca;
- filtros;
- fotos dos produtos;
- detalhes do produto;
- produtos relacionados;
- botão de contato;
- botão de WhatsApp;
- opção de solicitar orçamento ou pedido.

Área administrativa:

- dashboard;
- cadastro de produtos;
- categorias;
- imagens;
- preços;
- disponibilidade;
- pedidos ou solicitações;
- configurações.

O catálogo deve ser responsivo e otimizado para celular.
`.trim(),
  },

  {
    id: 'pdv-retail',
    name: 'PDV + Estoque',
    description:
      'Sistema para vendas no balcão com caixa, estoque, clientes e relatórios.',
    category: 'Comércio',
    projectType: 'pdv',
    icon: 'store',
    badge: 'Negócios',
    features: [
      'PDV',
      'Caixa',
      'Produtos',
      'Clientes',
      'Estoque',
      'Pagamentos',
      'Fiado',
      'Relatórios',
    ],
    prompt: `
Crie um sistema profissional de PDV e gestão de estoque.

O sistema deve possuir:

- dashboard;
- cadastro de produtos;
- categorias;
- clientes;
- fornecedores;
- estoque;
- entrada e saída de produtos;
- tela de PDV;
- busca rápida de produtos;
- carrinho da venda;
- desconto;
- formas de pagamento;
- dinheiro;
- Pix;
- débito;
- crédito;
- fiado;
- abertura de caixa;
- fechamento de caixa;
- histórico de vendas;
- cancelamentos;
- relatórios;
- usuários e permissões.

A tela de venda deve ser rápida e simples para operação em balcão.
`.trim(),
  },

  {
    id: 'academy-management',
    name: 'Gestão de Academias',
    description:
      'SaaS para academias, artes marciais e centros esportivos.',
    category: 'SaaS',
    projectType: 'saas',
    icon: 'academy',
    badge: '7System',
    features: [
      'Alunos',
      'Responsáveis',
      'Modalidades',
      'Contratos',
      'Mensalidades',
      'Pagamentos',
      'Inadimplência',
      'Relatórios',
    ],
    prompt: `
Crie um sistema SaaS profissional para gestão de academias e centros esportivos.

O sistema deve possuir:

- dashboard;
- cadastro de academias;
- alunos;
- responsáveis para alunos menores;
- modalidades;
- professores;
- turmas;
- horários;
- contratos;
- planos;
- mensalidades;
- vencimentos;
- pagamentos;
- histórico financeiro;
- alunos inadimplentes;
- bloqueio e ativação de alunos;
- relatórios;
- usuários;
- perfis e permissões;
- configurações.

Prepare o sistema para funcionar como SaaS multiacademia.

Cada academia deve visualizar somente os seus próprios alunos, contratos e informações financeiras.

A interface deve ser moderna, profissional e responsiva.
`.trim(),
  },

  {
    id: 'blank-project',
    name: 'Projeto em Branco',
    description:
      'Comece do zero e descreva exatamente o sistema que deseja construir.',
    category: 'Personalizado',
    projectType: 'custom',
    icon: 'custom',
    features: [
      'Estrutura livre',
      'Projeto personalizado',
      'IA',
      'React',
      'TypeScript',
      'Responsivo',
    ],
    prompt: '',
  },
];

export function getTemplateById(
  id: string,
): BuilderTemplate | undefined {
  return templates.find(
    (template) => template.id === id,
  );
}
