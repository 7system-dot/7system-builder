import {
  requirePermanentUser,
} from '~/lib/auth/auth.client';

import {
  getSupabaseClient,
} from '~/lib/supabase/supabase.client';

export type OrganizationRole =
  | 'owner'
  | 'admin'
  | 'editor'
  | 'viewer';

export interface ActiveOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  status: 'active' | 'suspended';
  role: OrganizationRole;
}

interface OrganizationMemberRow {
  organization_id: string;
  role: OrganizationRole;
  status: 'active' | 'suspended';
}

interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: 'active' | 'suspended';
}

const ACTIVE_ORGANIZATION_KEY =
  '7system-builder.active-organization-id';

/*
 * -------------------------------------------------
 * LOCAL STORAGE
 * -------------------------------------------------
 *
 * Serve somente para lembrar qual tenant
 * o usuário selecionou.
 *
 * Nunca usamos esse valor sozinho para
 * autorização.
 */

function getStoredOrganizationId():
  string | null {
  if (
    typeof window === 'undefined'
  ) {
    return null;
  }

  return window.localStorage.getItem(
    ACTIVE_ORGANIZATION_KEY,
  );
}

function storeOrganizationId(
  organizationId: string,
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.localStorage.setItem(
    ACTIVE_ORGANIZATION_KEY,
    organizationId,
  );
}

export function clearActiveOrganization():
  void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.localStorage.removeItem(
    ACTIVE_ORGANIZATION_KEY,
  );
}


/*
 * -------------------------------------------------
 * ORGANIZAÇÕES DO USUÁRIO
 * -------------------------------------------------
 */

export async function getOrganizationsForCurrentUser():
  Promise<ActiveOrganization[]> {
  const user =
    await requirePermanentUser();

  const supabase =
    getSupabaseClient();

  /*
   * Primeiro buscamos os memberships
   * permitidos pelo RLS.
   */
  const {
    data: memberships,
    error: membershipsError,
  } = await supabase
    .from('organization_members')
    .select(
      'organization_id, role, status',
    )
    .eq(
      'user_id',
      user.id,
    )
    .eq(
      'status',
      'active',
    );

  if (membershipsError) {
    throw new Error(
      `Erro ao carregar organizações do usuário: ${membershipsError.message}`,
    );
  }

  const memberRows =
    (
      memberships ?? []
    ) as OrganizationMemberRow[];

  if (
    memberRows.length === 0
  ) {
    return [];
  }

  const organizationIds =
    memberRows.map(
      (membership) =>
        membership.organization_id,
    );

  /*
   * Agora buscamos somente as
   * organizações das quais o usuário
   * é membro.
   */
  const {
    data: organizations,
    error: organizationsError,
  } = await supabase
    .from('organizations')
    .select(
      'id, name, slug, logo_url, status',
    )
    .in(
      'id',
      organizationIds,
    )
    .eq(
      'status',
      'active',
    );

  if (organizationsError) {
    throw new Error(
      `Erro ao carregar organizações: ${organizationsError.message}`,
    );
  }

  const organizationRows =
    (
      organizations ?? []
    ) as OrganizationRow[];

  const roleByOrganization =
    new Map<
      string,
      OrganizationRole
    >();

  for (
    const membership
    of memberRows
  ) {
    roleByOrganization.set(
      membership.organization_id,
      membership.role,
    );
  }

  return organizationRows
    .map(
      (
        organization,
      ): ActiveOrganization => ({
        id:
          organization.id,

        name:
          organization.name,

        slug:
          organization.slug,

        logoUrl:
          organization.logo_url ??
          undefined,

        status:
          organization.status,

        role:
          roleByOrganization.get(
            organization.id,
          ) ?? 'viewer',
      }),
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.name.localeCompare(
          second.name,
          'pt-BR',
        ),
    );
}


/*
 * -------------------------------------------------
 * ORGANIZAÇÃO ATIVA
 * -------------------------------------------------
 */

export async function getActiveOrganization():
  Promise<ActiveOrganization | null> {
  const organizations =
    await getOrganizationsForCurrentUser();

  if (
    organizations.length === 0
  ) {
    clearActiveOrganization();

    return null;
  }

  const storedId =
    getStoredOrganizationId();

  if (storedId) {
    const storedOrganization =
      organizations.find(
        (organization) =>
          organization.id ===
          storedId,
      );

    /*
     * Só aceitamos o valor salvo
     * se o usuário ainda pertencer
     * à organização.
     */
    if (storedOrganization) {
      return storedOrganization;
    }
  }

  /*
   * Se não existir escolha salva,
   * utiliza a primeira organização
   * disponível.
   */
  const defaultOrganization =
    organizations[0];

  storeOrganizationId(
    defaultOrganization.id,
  );

  return defaultOrganization;
}


export async function requireActiveOrganization():
  Promise<ActiveOrganization> {
  const organization =
    await getActiveOrganization();

  if (!organization) {
    throw new Error(
      'Sua conta não está vinculada a nenhuma organização ativa.',
    );
  }

  return organization;
}


/*
 * -------------------------------------------------
 * TROCAR ORGANIZAÇÃO
 * -------------------------------------------------
 */

export async function setActiveOrganization(
  organizationId: string,
): Promise<ActiveOrganization> {
  const organizations =
    await getOrganizationsForCurrentUser();

  const organization =
    organizations.find(
      (item) =>
        item.id ===
        organizationId,
    );

  if (!organization) {
    throw new Error(
      'Você não possui acesso a esta organização.',
    );
  }

  storeOrganizationId(
    organization.id,
  );

  return organization;
}


/*
 * -------------------------------------------------
 * PERMISSÕES DE INTERFACE
 * -------------------------------------------------
 *
 * Estas funções controlam somente
 * funcionalidades visuais.
 *
 * O banco continuará sendo protegido
 * por RLS.
 */

export function canManageOrganization(
  role: OrganizationRole,
): boolean {
  return (
    role === 'owner' ||
    role === 'admin'
  );
}

export function canEditProjects(
  role: OrganizationRole,
): boolean {
  return (
    role === 'owner' ||
    role === 'admin' ||
    role === 'editor'
  );
}

export function canDeleteProjects(
  role: OrganizationRole,
): boolean {
  return (
    role === 'owner' ||
    role === 'admin'
  );
}

export function canViewProjects(
  role: OrganizationRole,
): boolean {
  return (
    role === 'owner' ||
    role === 'admin' ||
    role === 'editor' ||
    role === 'viewer'
  );
}