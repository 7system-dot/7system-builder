import {
  requirePermanentUser,
} from '~/lib/auth/auth.client';

import {
  canManageOrganization,
  getOrganizationsForCurrentUser,
  type OrganizationRole,
} from './organization.client';

import {
  getSupabaseClient,
} from '~/lib/supabase/supabase.client';


export interface OrganizationMember {
  userId: string;

  fullName: string;

  email: string;

  role: OrganizationRole;

  status:
    | 'active'
    | 'suspended';

  joinedAt: string;
}


interface OrganizationMemberRow {
  user_id: string;

  role: OrganizationRole;

  status:
    | 'active'
    | 'suspended';

  joined_at: string;
}


interface ProfileSummaryRow {
  id: string;

  full_name: string;

  email:
    | string
    | null;
}


/*
 * -------------------------------------------------
 * VALIDAR ACESSO À ORGANIZAÇÃO
 * -------------------------------------------------
 */
async function requireOrganizationAccess(
  organizationId: string,
) {
  await requirePermanentUser();

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

  return organization;
}


/*
 * -------------------------------------------------
 * LISTAR MEMBROS
 * -------------------------------------------------
 */
export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  await requireOrganizationAccess(
    organizationId,
  );

  const supabase =
    getSupabaseClient();

  const {
    data: memberships,
    error: membershipsError,
  } = await supabase
    .from(
      'organization_members',
    )
    .select(
      `
        user_id,
        role,
        status,
        joined_at
      `,
    )
    .eq(
      'organization_id',
      organizationId,
    )
    .eq(
      'status',
      'active',
    )
    .order(
      'joined_at',
      {
        ascending: true,
      },
    );

  if (membershipsError) {
    throw new Error(
      `Não foi possível carregar os membros da empresa: ${membershipsError.message}`,
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

  const userIds =
    memberRows.map(
      (member) =>
        member.user_id,
    );


  /*
   * Consultamos profiles separadamente.
   *
   * A policy RLS criada nesta fase
   * permite somente perfis de usuários
   * que compartilham organização.
   */
  const {
    data: profiles,
    error: profilesError,
  } = await supabase
    .from('profiles')
    .select(
      `
        id,
        full_name,
        email
      `,
    )
    .in(
      'id',
      userIds,
    );

  if (profilesError) {
    throw new Error(
      `Não foi possível carregar os perfis da equipe: ${profilesError.message}`,
    );
  }

  const profileRows =
    (
      profiles ?? []
    ) as ProfileSummaryRow[];


  const profileByUserId =
    new Map<
      string,
      ProfileSummaryRow
    >();

  for (
    const profile
    of profileRows
  ) {
    profileByUserId.set(
      profile.id,
      profile,
    );
  }


  return memberRows.map(
    (
      member,
    ): OrganizationMember => {
      const profile =
        profileByUserId.get(
          member.user_id,
        );

      return {
        userId:
          member.user_id,

        fullName:
          profile
            ?.full_name
            ?.trim() ||
          'Usuário',

        email:
          profile
            ?.email ??
          '',

        role:
          member.role,

        status:
          member.status,

        joinedAt:
          member.joined_at,
      };
    },
  );
}


/*
 * -------------------------------------------------
 * ALTERAR NOME DA ORGANIZAÇÃO
 * -------------------------------------------------
 */
export async function updateOrganizationName(
  organizationId: string,
  name: string,
): Promise<void> {
  const organization =
    await requireOrganizationAccess(
      organizationId,
    );

  /*
   * Validação no frontend.
   *
   * A validação definitiva continua
   * sendo realizada pelo RLS.
   */
  if (
    !canManageOrganization(
      organization.role,
    )
  ) {
    throw new Error(
      'Seu papel não permite alterar os dados desta empresa.',
    );
  }

  const normalizedName =
    name.trim();

  if (
    normalizedName.length < 2
  ) {
    throw new Error(
      'O nome da empresa deve possuir pelo menos 2 caracteres.',
    );
  }

  if (
    normalizedName.length > 120
  ) {
    throw new Error(
      'O nome da empresa não pode ultrapassar 120 caracteres.',
    );
  }

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } = await supabase
    .from('organizations')
    .update({
      name:
        normalizedName,
    })
    .eq(
      'id',
      organizationId,
    )
    .select(
      'id',
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível atualizar a empresa: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      'A empresa não foi atualizada. Verifique suas permissões.',
    );
  }
}