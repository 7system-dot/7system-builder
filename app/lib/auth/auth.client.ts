import type {
  AuthChangeEvent,
  Session,
  User,
} from '@supabase/supabase-js';

import {
  getSupabaseClient,
} from '~/lib/supabase/supabase.client';

/*
 * Rotas utilizadas pelo sistema de autenticação.
 */
export const AUTH_PATHS = {
  login: '/login',
  register: '/register',
  finishAccount: '/finish-account',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

/*
 * Códigos de erro próprios do 7System Builder.
 *
 * Isso permitirá que as telas mostrem mensagens
 * específicas sem depender diretamente das
 * mensagens internas do Supabase.
 */
export type BuilderAuthErrorCode =
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'USER_NOT_AUTHENTICATED'
  | 'USER_NOT_ANONYMOUS'
  | 'ANONYMOUS_SESSION_ACTIVE'
  | 'ALREADY_AUTHENTICATED'
  | 'EMAIL_NOT_VERIFIED'
  | 'SUPABASE_AUTH_ERROR'
  | 'BROWSER_REQUIRED';

export class BuilderAuthError extends Error {
  code: BuilderAuthErrorCode;

  constructor(
    code: BuilderAuthErrorCode,
    message: string,
  ) {
    super(message);

    this.name = 'BuilderAuthError';
    this.code = code;
  }
}

export interface AuthResult {
  user: User;
  session: Session | null;
}

export type RegisterMode =
  | 'new-account'
  | 'anonymous-upgrade-started';

export interface RegisterResult {
  mode: RegisterMode;
  user: User | null;
  session: Session | null;
}

/*
 * Normaliza o e-mail antes de enviá-lo
 * para o Supabase.
 */
function normalizeEmail(
  email: string,
): string {
  return email
    .trim()
    .toLowerCase();
}

/*
 * Validação básica de e-mail.
 *
 * O Supabase continuará fazendo sua própria
 * validação no servidor.
 */
function validateEmail(
  email: string,
): string {
  const normalizedEmail =
    normalizeEmail(email);

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !normalizedEmail ||
    !emailRegex.test(
      normalizedEmail,
    )
  ) {
    throw new BuilderAuthError(
      'INVALID_EMAIL',
      'Informe um endereço de e-mail válido.',
    );
  }

  return normalizedEmail;
}

/*
 * Regra inicial de senha do 7System Builder.
 *
 * Podemos aumentar a complexidade depois,
 * mas nunca armazenamos a senha no frontend.
 */
function validatePassword(
  password: string,
): void {
  if (
    !password ||
    password.length < 8
  ) {
    throw new BuilderAuthError(
      'WEAK_PASSWORD',
      'A senha deve possuir pelo menos 8 caracteres.',
    );
  }
}

/*
 * Cria uma URL usando o domínio real que
 * está aberto no navegador.
 *
 * Produção:
 * https://builder-v2.7systemconsultoria.com.br
 */
function getRedirectUrl(
  path: string,
): string {
  if (
    typeof window === 'undefined'
  ) {
    throw new BuilderAuthError(
      'BROWSER_REQUIRED',
      'Esta operação de autenticação precisa ser executada no navegador.',
    );
  }

  return new URL(
    path,
    window.location.origin,
  ).toString();
}

/*
 * Converte erros do Supabase para
 * erros padronizados do Builder.
 */
function throwSupabaseError(
  action: string,
  error: {
    message: string;
  },
): never {
  throw new BuilderAuthError(
    'SUPABASE_AUTH_ERROR',
    `${action}: ${error.message}`,
  );
}

/*
 * -------------------------------------------------
 * SESSÃO
 * -------------------------------------------------
 */

export async function getCurrentSession():
  Promise<Session | null> {
  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } =
    await supabase.auth.getSession();

  if (error) {
    throwSupabaseError(
      'Erro ao carregar sessão',
      error,
    );
  }

  return data.session ?? null;
}

/*
 * Retorna o usuário realmente validado
 * pelo servidor Supabase.
 */
export async function getCurrentUser():
  Promise<User | null> {
  const session =
    await getCurrentSession();

  if (!session) {
    return null;
  }

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    throwSupabaseError(
      'Erro ao identificar usuário',
      error,
    );
  }

  return data.user ?? null;
}

/*
 * Identifica se o usuário atual é anônimo.
 */
export function isAnonymousUser(
  user:
    | User
    | null
    | undefined,
): boolean {
  return (
    user?.is_anonymous === true
  );
}

/*
 * -------------------------------------------------
 * USUÁRIO ANÔNIMO
 * -------------------------------------------------
 */

/*
 * Mantém temporariamente o comportamento que
 * já utilizamos na Fase 2.7.5.
 *
 * Se existir usuário:
 * retorna o mesmo usuário.
 *
 * Se não existir:
 * cria um usuário anônimo.
 */
export async function ensureAnonymousUser():
  Promise<User> {
  const currentUser =
    await getCurrentUser();

  if (currentUser) {
    return currentUser;
  }

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } =
    await supabase.auth
      .signInAnonymously();

  if (error) {
    throwSupabaseError(
      'Não foi possível iniciar a sessão',
      error,
    );
  }

  if (!data.user) {
    throw new BuilderAuthError(
      'SUPABASE_AUTH_ERROR',
      'O Supabase não retornou o usuário anônimo.',
    );
  }

  return data.user;
}

/*
 * -------------------------------------------------
 * LOGIN
 * -------------------------------------------------
 */

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalizedEmail =
    validateEmail(email);

  validatePassword(password);

  /*
   * Não substituímos silenciosamente uma
   * sessão anônima por outra conta.
   *
   * Isso poderia deixar projetos presos
   * no UUID do usuário anônimo.
   */
  const currentUser =
    await getCurrentUser();

  if (
    currentUser &&
    isAnonymousUser(
      currentUser,
    )
  ) {
    throw new BuilderAuthError(
      'ANONYMOUS_SESSION_ACTIVE',
      'Existe uma sessão anônima ativa. Converta essa sessão em uma conta permanente para preservar seus projetos.',
    );
  }

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } =
    await supabase.auth
      .signInWithPassword({
        email:
          normalizedEmail,

        password,
      });

  if (error) {
    throwSupabaseError(
      'Não foi possível entrar',
      error,
    );
  }

  if (!data.user) {
    throw new BuilderAuthError(
      'SUPABASE_AUTH_ERROR',
      'O Supabase não retornou o usuário autenticado.',
    );
  }

  return {
    user:
      data.user,

    session:
      data.session,
  };
}

/*
 * -------------------------------------------------
 * NOVO CADASTRO
 * -------------------------------------------------
 */

/*
 * Para um usuário completamente novo,
 * cria conta com e-mail e senha.
 *
 * IMPORTANTE:
 * Se já existir usuário anônimo, esta função
 * NÃO cria outro UUID.
 *
 * Ela inicia automaticamente o processo de
 * conversão da conta anônima.
 */
export async function registerWithPassword(
  email: string,
  password: string,
  displayName?: string,
): Promise<RegisterResult> {
  const normalizedEmail =
    validateEmail(email);

  validatePassword(password);

  const currentUser =
    await getCurrentUser();

  /*
   * Usuário já está navegando com UUID anônimo.
   *
   * Não usamos signUp().
   * Preservamos o UUID existente.
   */
  if (
    currentUser &&
    isAnonymousUser(
      currentUser,
    )
  ) {
    const upgradedUser =
      await startAnonymousUpgrade(
        normalizedEmail,
        displayName,
      );

    const session =
      await getCurrentSession();

    return {
      mode:
        'anonymous-upgrade-started',

      user:
        upgradedUser,

      session,
    };
  }

  /*
   * Usuário permanente já está conectado.
   */
  if (currentUser) {
    throw new BuilderAuthError(
      'ALREADY_AUTHENTICATED',
      'Já existe uma conta autenticada neste navegador.',
    );
  }

  const supabase =
    getSupabaseClient();

  const metadata =
    displayName?.trim()
      ? {
          name:
            displayName.trim(),
        }
      : undefined;

  const {
    data,
    error,
  } =
    await supabase.auth.signUp({
      email:
        normalizedEmail,

      password,

      options: {
        emailRedirectTo:
          getRedirectUrl(
            AUTH_PATHS.finishAccount,
          ),

        data:
          metadata,
      },
    });

  if (error) {
    throwSupabaseError(
      'Não foi possível criar a conta',
      error,
    );
  }

  return {
    mode:
      'new-account',

    user:
      data.user,

    session:
      data.session,
  };
}

/*
 * -------------------------------------------------
 * CONVERTER USUÁRIO ANÔNIMO
 * -------------------------------------------------
 */

/*
 * Etapa 1:
 *
 * UUID anônimo
 *      ↓
 * adiciona e-mail
 *      ↓
 * Supabase envia confirmação
 *
 * Ainda NÃO definimos uma nova senha aqui.
 */
export async function startAnonymousUpgrade(
  email: string,
  displayName?: string,
): Promise<User> {
  const normalizedEmail =
    validateEmail(email);

  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    throw new BuilderAuthError(
      'USER_NOT_AUTHENTICATED',
      'Nenhum usuário está autenticado.',
    );
  }

  if (
    !isAnonymousUser(
      currentUser,
    )
  ) {
    throw new BuilderAuthError(
      'USER_NOT_ANONYMOUS',
      'Esta conta já é uma conta permanente.',
    );
  }

  const supabase =
    getSupabaseClient();

  const metadata =
    displayName?.trim()
      ? {
          ...currentUser
            .user_metadata,

          name:
            displayName.trim(),
        }
      : undefined;

  const {
    data,
    error,
  } =
    await supabase.auth
      .updateUser(
        {
          email:
            normalizedEmail,

          ...(metadata
            ? {
                data:
                  metadata,
              }
            : {}),
        },
        {
          emailRedirectTo:
            getRedirectUrl(
              AUTH_PATHS.finishAccount,
            ),
        },
      );

  if (error) {
    throwSupabaseError(
      'Não foi possível vincular o e-mail à conta',
      error,
    );
  }

  if (!data.user) {
    throw new BuilderAuthError(
      'SUPABASE_AUTH_ERROR',
      'O Supabase não retornou o usuário atualizado.',
    );
  }

  return data.user;
}

/*
 * Etapa 2:
 *
 * Depois que o usuário clicar no e-mail
 * e o endereço estiver confirmado,
 * definimos a senha.
 *
 * O UUID continua o mesmo.
 */
export async function finishAccount(
  password: string,
): Promise<User> {
  validatePassword(password);

  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    throw new BuilderAuthError(
      'USER_NOT_AUTHENTICATED',
      'A sessão de confirmação não foi encontrada.',
    );
  }

  if (
    !currentUser.email
  ) {
    throw new BuilderAuthError(
      'EMAIL_NOT_VERIFIED',
      'Nenhum e-mail foi vinculado a esta conta.',
    );
  }

  if (
    !currentUser
      .email_confirmed_at
  ) {
    throw new BuilderAuthError(
      'EMAIL_NOT_VERIFIED',
      'Confirme seu e-mail antes de definir a senha.',
    );
  }

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } =
    await supabase.auth
      .updateUser({
        password,
      });

  if (error) {
    throwSupabaseError(
      'Não foi possível definir a senha',
      error,
    );
  }

  if (!data.user) {
    throw new BuilderAuthError(
      'SUPABASE_AUTH_ERROR',
      'O Supabase não retornou a conta atualizada.',
    );
  }

  return data.user;
}

/*
 * -------------------------------------------------
 * RECUPERAÇÃO DE SENHA
 * -------------------------------------------------
 */

export async function requestPasswordReset(
  email: string,
): Promise<void> {
  const normalizedEmail =
    validateEmail(email);

  const supabase =
    getSupabaseClient();

  const {
    error,
  } =
    await supabase.auth
      .resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo:
            getRedirectUrl(
              AUTH_PATHS.resetPassword,
            ),
        },
      );

  if (error) {
    throwSupabaseError(
      'Não foi possível enviar o e-mail de recuperação',
      error,
    );
  }
}

/*
 * Usada na página /reset-password.
 */
export async function updatePassword(
  newPassword: string,
): Promise<User> {
  validatePassword(
    newPassword,
  );

  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    throw new BuilderAuthError(
      'USER_NOT_AUTHENTICATED',
      'A sessão de recuperação de senha não foi encontrada.',
    );
  }

  const supabase =
    getSupabaseClient();

  const {
    data,
    error,
  } =
    await supabase.auth
      .updateUser({
        password:
          newPassword,
      });

  if (error) {
    throwSupabaseError(
      'Não foi possível atualizar a senha',
      error,
    );
  }

  if (!data.user) {
    throw new BuilderAuthError(
      'SUPABASE_AUTH_ERROR',
      'O Supabase não retornou o usuário após atualizar a senha.',
    );
  }

  return data.user;
}

/*
 * -------------------------------------------------
 * LOGOUT
 * -------------------------------------------------
 */

export async function logout():
  Promise<void> {
  const supabase =
    getSupabaseClient();

  const {
    error,
  } =
    await supabase.auth.signOut({
      scope:
        'local',
    });

  if (error) {
    throwSupabaseError(
      'Não foi possível sair',
      error,
    );
  }
}

/*
 * -------------------------------------------------
 * EVENTOS DE AUTENTICAÇÃO
 * -------------------------------------------------
 */

/*
 * Será usado futuramente pelo AppShell
 * para atualizar automaticamente:
 *
 * usuário entrou
 * usuário saiu
 * senha alterada
 * usuário atualizado
 */
export function subscribeToAuthChanges(
  callback: (
    event: AuthChangeEvent,
    session: Session | null,
  ) => void,
): () => void {
  const supabase =
    getSupabaseClient();

  const {
    data,
  } =
    supabase.auth
      .onAuthStateChange(
        (
          event,
          session,
        ) => {
          callback(
            event,
            session,
          );
        },
      );

  return () => {
    data.subscription
      .unsubscribe();
  };
}