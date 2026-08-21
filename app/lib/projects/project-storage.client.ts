
import {
  requirePermanentUser,
} from '~/lib/auth/auth.client';

import {
  canDeleteProjects,
  canEditProjects,
  canViewProjects,
  requireActiveOrganization,
} from '~/lib/organizations/organization.client';

import {
  getSupabaseClient,
} from '~/lib/supabase/supabase.client';

export type ProjectType =
  | 'saas'
  | 'ecommerce'
  | 'site'
  | 'catalog'
  | 'pdv'
  | 'custom';

export type ProjectStatus =
  | 'draft'
  | 'building'
  | 'published';

export interface ProjectRecord {
  id: string;

  organizationId: string;

  name: string;
  type: ProjectType;
  description: string;

  templateId?: string;
  templateName?: string;

  useSupabase: boolean;
  responsive: boolean;

  status: ProjectStatus;

  createdAt: string;
  updatedAt: string;

  lastPrompt?: string;
}

export interface SaveProjectInput {
  id?: string;

  name: string;
  type: ProjectType;
  description: string;

  templateId?: string;
  templateName?: string;

  useSupabase: boolean;
  responsive: boolean;

  status: ProjectStatus;

  lastPrompt?: string;
}

interface BuilderProjectRow {
  id: string;

  user_id: string;

  organization_id: string;

  name: string;
  type: ProjectType;
  description: string;

  template_id: string | null;
  template_name: string | null;

  use_supabase: boolean;
  responsive: boolean;

  status: ProjectStatus;

  last_prompt: string | null;

  created_at: string;
  updated_at: string;
}

const LEGACY_STORAGE_KEY =
  '7system-builder.projects';

function rowToProject(
  row: BuilderProjectRow,
): ProjectRecord {
  return {
    id: row.id,

    organizationId:
    row.organization_id,

    name: row.name,
    type: row.type,
    description: row.description,

    templateId:
      row.template_id ?? undefined,

    templateName:
      row.template_name ?? undefined,

    useSupabase:
      row.use_supabase,

    responsive:
      row.responsive,

    status:
      row.status,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    lastPrompt:
      row.last_prompt ?? undefined,
  };
}

export async function getProjects():
  Promise<ProjectRecord[]> {
  const supabase =
    getSupabaseClient();

  const organization =
    await requireActiveOrganization();

  if (
  !canViewProjects(
    organization.role,
  )
) {
  throw new Error(
    'Seu papel não permite visualizar projetos nesta organização.',
  );
}

  const {
    data,
    error,
  } = await supabase
    .from('builder_projects')
    .select('*')
    .eq(
  'organization_id',
  organization.id,
)
    .order(
      'updated_at',
      {
        ascending: false,
      },
    );

  if (error) {
    throw new Error(
      `Erro ao carregar projetos: ${error.message}`,
    );
  }

  return (
    (data ?? []) as BuilderProjectRow[]
  ).map(rowToProject);
}

export async function getProjectById(
  id: string,
): Promise<ProjectRecord | undefined> {
  const supabase =
    getSupabaseClient();

  const organization =
  await requireActiveOrganization();

  if (
  !canViewProjects(
    organization.role,
  )
) {
  throw new Error(
    'Seu papel não permite visualizar este projeto.',
  );
}

  const {
    data,
    error,
  } = await supabase
    .from('builder_projects')
    .select('*')
    .eq('id', id)
    .eq(
  'organization_id',
  organization.id,
)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao carregar projeto: ${error.message}`,
    );
  }

  if (!data) {
    return undefined;
  }

  return rowToProject(
    data as BuilderProjectRow,
  );
}

export async function saveProject(
  input: SaveProjectInput,
): Promise<ProjectRecord> {
  const supabase =
    getSupabaseClient();

  const user =
    await requirePermanentUser();

  const organization =
    await requireActiveOrganization();

    if (
  !canEditProjects(
    organization.role,
  )
) {
  throw new Error(
    'Seu papel permite apenas visualizar projetos.',
  );
}

  /*
   * EDITAR PROJETO EXISTENTE
   */
  if (input.id) {
    const updatePayload = {
      name:
        input.name.trim(),

      type:
        input.type,

      description:
        input.description.trim(),

      use_supabase:
        input.useSupabase,

      responsive:
        input.responsive,

      status:
        input.status,

      last_prompt:
        input.lastPrompt ?? null,

      ...(input.templateId !== undefined
        ? {
            template_id:
              input.templateId,
          }
        : {}),

      ...(input.templateName !== undefined
        ? {
            template_name:
              input.templateName,
          }
        : {}),
    };

    const {
      data,
      error,
    } = await supabase
      .from('builder_projects')
      .update(updatePayload)
      .eq('id', input.id)
      .eq(
  'organization_id',
  organization.id,
)
      .select('*')
      .single();

    if (error) {
      throw new Error(
        `Erro ao atualizar projeto: ${error.message}`,
      );
    }

    return rowToProject(
      data as BuilderProjectRow,
    );
  }

  /*
   * CRIAR NOVO PROJETO
   */
  const {
    data,
    error,
  } = await supabase
    .from('builder_projects')
    .insert({
      user_id:
        user.id,

    organization_id:
        organization.id,

    name:
        input.name.trim(),

      type:
        input.type,

      description:
        input.description.trim(),

      template_id:
        input.templateId ?? null,

      template_name:
        input.templateName ?? null,

      use_supabase:
        input.useSupabase,

      responsive:
        input.responsive,

      status:
        input.status,

      last_prompt:
        input.lastPrompt ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(
      `Erro ao criar projeto: ${error.message}`,
    );
  }

  return rowToProject(
    data as BuilderProjectRow,
  );
}

export async function deleteProject(
  id: string,
): Promise<void> {
  const supabase =
    getSupabaseClient();

  const organization =
    await requireActiveOrganization();

  if (
  !canDeleteProjects(
    organization.role,
  )
) {
  throw new Error(
    'Somente proprietários e administradores podem excluir projetos.',
  );
}

  const {
    error,
  } = await supabase
    .from('builder_projects')
    .delete()
    .eq('id', id)
    .eq(
  'organization_id',
  organization.id,
);

  if (error) {
    throw new Error(
      `Erro ao excluir projeto: ${error.message}`,
    );
  }
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<void> {
  const supabase =
    getSupabaseClient();

  const organization =
    await requireActiveOrganization();

  if (
  !canEditProjects(
    organization.role,
  )
) {
  throw new Error(
    'Seu papel não permite alterar projetos.',
  );
}

  const {
    error,
  } = await supabase
    .from('builder_projects')
    .update({
      status,
    })
    .eq('id', id)
    .eq(
  'organization_id',
  organization.id,
);

  if (error) {
    throw new Error(
      `Erro ao atualizar status: ${error.message}`,
    );
  }
}

/*
 * Migração única:
 *
 * localStorage antigo
 *        ↓
 * Supabase
 *        ↓
 * remove localStorage
 */
export async function migrateLegacyProjectsToSupabase():
  Promise<number> {
  if (typeof window === 'undefined') {
    return 0;
  }

  const raw =
    window.localStorage.getItem(
      LEGACY_STORAGE_KEY,
    );

  if (!raw) {
    return 0;
  }

  let legacyProjects:
    ProjectRecord[];

  try {
    legacyProjects =
      JSON.parse(raw) as ProjectRecord[];
  } catch {
    console.warn(
      'Não foi possível interpretar projetos antigos do localStorage.',
    );

    return 0;
  }

  if (
    !Array.isArray(legacyProjects) ||
    legacyProjects.length === 0
  ) {
    window.localStorage.removeItem(
      LEGACY_STORAGE_KEY,
    );

    return 0;
  }

  const supabase =
    getSupabaseClient();

  const user =
    await requirePermanentUser();

  const organization =
    await requireActiveOrganization();

  if (
  !canEditProjects(
    organization.role,
  )
) {
  /*
   * Viewer não pode migrar dados
   * para dentro da organização.
   */
  return 0;
}

  /*
   * Busca projetos existentes para evitar
   * duplicação caso a migração seja executada
   * novamente.
   */
  const {
    data: existingRows,
    error: existingError,
  } = await supabase
    .from('builder_projects')
    .select(
      'name, created_at',
    )
    .eq(
  'organization_id',
  organization.id,
);

  if (existingError) {
    throw new Error(
      `Erro ao verificar migração: ${existingError.message}`,
    );
  }

  const existingKeys =
    new Set(
      (
        existingRows ?? []
      ).map(
        (row) =>
          `${row.name}|${row.created_at}`,
      ),
    );

  let migratedCount = 0;

  for (
    const project
    of legacyProjects
  ) {
    const createdAt =
      project.createdAt ??
      new Date().toISOString();

    const migrationKey =
      `${project.name}|${createdAt}`;

    if (
      existingKeys.has(
        migrationKey,
      )
    ) {
      continue;
    }

    const {
      error,
    } = await supabase
      .from('builder_projects')
      .insert({
  user_id:
    user.id,

  organization_id:
    organization.id,

  name:
    project.name,

        type:
          project.type,

        description:
          project.description ?? '',

        template_id:
          project.templateId ?? null,

        template_name:
          project.templateName ?? null,

        use_supabase:
          project.useSupabase ?? true,

        responsive:
          project.responsive ?? true,

        status:
          project.status ?? 'draft',

        last_prompt:
          project.lastPrompt ?? null,

        created_at:
          createdAt,

        updated_at:
          project.updatedAt ??
          createdAt,
      });

    if (error) {
      throw new Error(
        `Erro ao migrar "${project.name}": ${error.message}`,
      );
    }

    migratedCount += 1;

    existingKeys.add(
      migrationKey,
    );
  }

  /*
   * Só remove o armazenamento antigo
   * depois que toda a migração terminar
   * corretamente.
   */
  window.localStorage.removeItem(
    LEGACY_STORAGE_KEY,
  );

  return migratedCount;
}

export const projectTypeLabels:
  Record<ProjectType, string> = {
    saas:
      'SaaS',

    ecommerce:
      'E-commerce',

    site:
      'Site',

    catalog:
      'Catálogo',

    pdv:
      'PDV',

    custom:
      'Personalizado',
  };

export const projectStatusLabels:
  Record<ProjectStatus, string> = {
    draft:
      'Rascunho',

    building:
      'Em desenvolvimento',

    published:
      'Publicado',
  };
