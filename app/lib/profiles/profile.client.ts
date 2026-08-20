import {
  requirePermanentUser,
} from '~/lib/auth/auth.client';

import {
  getSupabaseClient,
} from '~/lib/supabase/supabase.client';

export const PROFILE_UPDATED_EVENT =
  '7system:profile-updated';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  fullName: string;
  phone?: string;
}

function rowToProfile(
  row: ProfileRow,
  authEmail?: string | null,
): UserProfile {
  return {
    id:
      row.id,

    fullName:
      row.full_name,

    email:
      row.email ??
      authEmail ??
      '',

    phone:
      row.phone ??
      undefined,

    avatarUrl:
      row.avatar_url ??
      undefined,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}


/*
 * -------------------------------------------------
 * CARREGAR PERFIL ATUAL
 * -------------------------------------------------
 */
export async function getCurrentProfile():
  Promise<UserProfile> {
  const user =
    await requirePermanentUser();

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } = await supabase
    .from('profiles')
    .select(
      `
        id,
        full_name,
        email,
        phone,
        avatar_url,
        created_at,
        updated_at
      `,
    )
    .eq(
      'id',
      user.id,
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível carregar seu perfil: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      'O perfil desta conta não foi encontrado.',
    );
  }

  return rowToProfile(
    data as ProfileRow,
    user.email,
  );
}


/*
 * -------------------------------------------------
 * ATUALIZAR PERFIL ATUAL
 * -------------------------------------------------
 */
export async function updateCurrentProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const user =
    await requirePermanentUser();

  const fullName =
    input.fullName.trim();

  const phone =
    input.phone?.trim() ?? '';

  if (
    fullName.length < 2
  ) {
    throw new Error(
      'Informe um nome com pelo menos 2 caracteres.',
    );
  }

  if (
    fullName.length > 120
  ) {
    throw new Error(
      'O nome não pode ultrapassar 120 caracteres.',
    );
  }

  if (
    phone.length > 30
  ) {
    throw new Error(
      'O telefone informado é muito longo.',
    );
  }

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } = await supabase
    .from('profiles')
    .update({
      full_name:
        fullName,

      phone:
        phone || null,
    })
    .eq(
      'id',
      user.id,
    )
    .select(
      `
        id,
        full_name,
        email,
        phone,
        avatar_url,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `Não foi possível atualizar seu perfil: ${error.message}`,
    );
  }

  const profile =
    rowToProfile(
      data as ProfileRow,
      user.email,
    );

  /*
   * Avisa componentes como o AppShell
   * que o perfil mudou.
   */
  if (
    typeof window !== 'undefined'
  ) {
    window.dispatchEvent(
      new CustomEvent(
        PROFILE_UPDATED_EVENT,
      ),
    );
  }

  return profile;
}