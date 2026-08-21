import {
  getSupabaseClient,
} from '~/lib/supabase/supabase.client';

import type {
  OrganizationRole,
} from './organization.client';


export interface OrganizationInvitation {
  id: string;

  organizationId: string;

  email: string;

  role:
    Exclude<
      OrganizationRole,
      'owner'
    >;

  status:
    | 'pending'
    | 'accepted'
    | 'revoked'
    | 'expired';

  expiresAt: string;

  createdAt: string;
}


interface InvitationRow {
  id: string;

  organization_id: string;

  email: string;

  role:
    'admin' |
    'editor' |
    'viewer';

  status:
    'pending' |
    'accepted' |
    'revoked' |
    'expired';

  expires_at: string;

  created_at: string;
}


export interface AcceptInvitationResult {
  organizationId: string;

  organizationName: string;

  role: string;
}


/*
 * -------------------------------------------------
 * ENVIAR CONVITE
 * -------------------------------------------------
 */
export async function sendOrganizationInvitation(
  organizationId: string,
  email: string,
  role:
    'admin' |
    'editor' |
    'viewer',
): Promise<void> {

  const supabase =
    getSupabaseClient();


  const {
    data,
    error,
  } =
    await supabase.functions
      .invoke(
        'send-organization-invite',

        {
          body: {
            organizationId,
            email,
            role,
          },
        },
      );


  if (error) {
    throw new Error(
      `Não foi possível enviar o convite: ${error.message}`,
    );
  }


  if (
    data?.error
  ) {
    throw new Error(
      data.error,
    );
  }
}


/*
 * -------------------------------------------------
 * CONVITES PENDENTES
 * -------------------------------------------------
 */
export async function getPendingOrganizationInvitations(
  organizationId: string,
): Promise<
  OrganizationInvitation[]
> {

  const supabase =
    getSupabaseClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        'organization_invitations',
      )
      .select(
        `
          id,
          organization_id,
          email,
          role,
          status,
          expires_at,
          created_at
        `,
      )
      .eq(
        'organization_id',
        organizationId,
      )
      .eq(
        'status',
        'pending',
      )
      .order(
        'created_at',
        {
          ascending: false,
        },
      );


  if (error) {
    throw new Error(
      `Não foi possível carregar os convites: ${error.message}`,
    );
  }


  return (
    (
      data ?? []
    ) as InvitationRow[]
  ).map(
    (
      row,
    ): OrganizationInvitation => ({

      id:
        row.id,

      organizationId:
        row.organization_id,

      email:
        row.email,

      role:
        row.role,

      status:
        row.status,

      expiresAt:
        row.expires_at,

      createdAt:
        row.created_at,

    }),
  );
}


/*
 * -------------------------------------------------
 * CANCELAR
 * -------------------------------------------------
 */
export async function cancelOrganizationInvitation(
  invitationId: string,
): Promise<void> {

  const supabase =
    getSupabaseClient();


  const {
    error,
  } =
    await supabase.rpc(
      'cancel_organization_invitation',

      {
        target_invitation_id:
          invitationId,
      },
    );


  if (error) {
    throw new Error(
      `Não foi possível cancelar o convite: ${error.message}`,
    );
  }
}


/*
 * -------------------------------------------------
 * ACEITAR
 * -------------------------------------------------
 */
export async function acceptOrganizationInvitation(
  invitationId: string,
): Promise<
  AcceptInvitationResult
> {

  const supabase =
    getSupabaseClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      'accept_organization_invitation',

      {
        target_invitation_id:
          invitationId,
      },
    );


  if (error) {
    throw new Error(
      `Não foi possível aceitar o convite: ${error.message}`,
    );
  }


  const row =
    Array.isArray(data)
      ? data[0]
      : data;


  if (!row) {
    throw new Error(
      'O convite não retornou uma organização.',
    );
  }


  return {

    organizationId:
      row.organization_id,

    organizationName:
      row.organization_name,

    role:
      row.member_role,

  };
}