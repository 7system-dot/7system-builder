import {
  createClient,
} from 'npm:@supabase/supabase-js@2';


const corsHeaders = {
  'Access-Control-Allow-Origin':
    '*',

  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':
    'POST, OPTIONS',
};


function getPublishableKey():
  string {

  const legacyKey =
    Deno.env.get(
      'SUPABASE_ANON_KEY',
    );

  if (legacyKey) {
    return legacyKey;
  }


  const singleKey =
    Deno.env.get(
      'SUPABASE_PUBLISHABLE_KEY',
    );

  if (singleKey) {
    return singleKey;
  }


  const keysJson =
    Deno.env.get(
      'SUPABASE_PUBLISHABLE_KEYS',
    );

  if (keysJson) {
    const keys =
      JSON.parse(
        keysJson,
      ) as Record<
        string,
        string
      >;

    const defaultKey =
      keys.default ??
      Object.values(keys)[0];

    if (defaultKey) {
      return defaultKey;
    }
  }


  throw new Error(
    'Publishable key do Supabase não encontrada.',
  );
}


Deno.serve(
  async (
    req: Request,
  ) => {

    if (
      req.method ===
      'OPTIONS'
    ) {
      return new Response(
        'ok',

        {
          headers:
            corsHeaders,
        },
      );
    }


    try {

      if (
        req.method !==
        'POST'
      ) {
        return Response.json(
          {
            error:
              'Método não permitido.',
          },

          {
            status: 405,
            headers:
              corsHeaders,
          },
        );
      }


      const supabaseUrl =
        Deno.env.get(
          'SUPABASE_URL',
        );

      const appUrl =
        Deno.env.get(
          'APP_URL',
        );

      const authorization =
        req.headers.get(
          'Authorization',
        );


      if (!supabaseUrl) {
        throw new Error(
          'SUPABASE_URL não configurada.',
        );
      }


      if (!appUrl) {
        throw new Error(
          'APP_URL não configurada.',
        );
      }


      if (!authorization) {

        return Response.json(
          {
            error:
              'Usuário não autenticado.',
          },

          {
            status: 401,
            headers:
              corsHeaders,
          },
        );

      }


      const publishableKey =
        getPublishableKey();


      /*
       * Cliente que representa
       * o usuário que chamou a função.
       */
      const callerClient =
        createClient(

          supabaseUrl,

          publishableKey,

          {
            global: {
              headers: {
                Authorization:
                  authorization,
              },
            },

            auth: {
              autoRefreshToken:
                false,

              persistSession:
                false,

              detectSessionInUrl:
                false,
            },
          },

        );


      /*
       * Validação explícita do usuário.
       */
      const {
        data: userData,
        error: userError,
      } =
        await callerClient.auth
          .getUser();


      if (
        userError ||
        !userData.user
      ) {

        return Response.json(
          {
            error:
              'Sessão inválida.',
          },

          {
            status: 401,
            headers:
              corsHeaders,
          },
        );

      }


      const body =
        await req.json();


      const organizationId =
        String(
          body.organizationId ??
          '',
        ).trim();


      const email =
        String(
          body.email ??
          '',
        )
          .trim()
          .toLowerCase();


      const role =
        String(
          body.role ??
          '',
        ).trim();


      if (
        !organizationId ||
        !email ||
        !role
      ) {

        return Response.json(
          {
            error:
              'Organização, e-mail e papel são obrigatórios.',
          },

          {
            status: 400,
            headers:
              corsHeaders,
          },
        );

      }


      /*
       * A RPC valida novamente:
       *
       * owner/admin,
       * organização,
       * e-mail,
       * papel,
       * usuário existente etc.
       */
      const {
        data: invitationId,
        error: invitationError,
      } =
        await callerClient
          .rpc(
            'create_organization_invitation',

            {
              target_organization_id:
                organizationId,

              target_email:
                email,

              target_role:
                role,
            },
          );


      if (
        invitationError ||
        !invitationId
      ) {

        return Response.json(
          {
            error:
              invitationError
                ?.message ??
              'Não foi possível criar o convite.',
          },

          {
            status: 400,
            headers:
              corsHeaders,
          },
        );

      }


      const redirectTo =
        `${appUrl.replace(
          /\/$/,
          '',
        )}/accept-invite?invitation=${encodeURIComponent(
          invitationId,
        )}`;


      /*
       * Cliente separado apenas para
       * enviar o Magic Link.
       *
       * shouldCreateUser=true permite
       * funcionar com conta nova
       * ou conta existente.
       */
      const emailClient =
        createClient(

          supabaseUrl,

          publishableKey,

          {
            auth: {
              autoRefreshToken:
                false,

              persistSession:
                false,

              detectSessionInUrl:
                false,
            },
          },

        );


      const {
        error: emailError,
      } =
        await emailClient.auth
          .signInWithOtp({

            email,

            options: {

              shouldCreateUser:
                true,

              emailRedirectTo:
                redirectTo,

            },

          });


      if (emailError) {

        /*
         * Se o envio falhar,
         * cancelamos o convite
         * criado anteriormente.
         */
        await callerClient.rpc(
          'cancel_organization_invitation',

          {
            target_invitation_id:
              invitationId,
          },
        );


        return Response.json(
          {
            error:
              `Não foi possível enviar o e-mail: ${emailError.message}`,
          },

          {
            status: 400,
            headers:
              corsHeaders,
          },
        );

      }


      return Response.json(
        {
          success: true,

          invitationId,

          email,
        },

        {
          status: 200,

          headers:
            corsHeaders,
        },
      );

    } catch (error) {

      console.error(
        'send-organization-invite:',
        error,
      );


      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Erro interno ao enviar convite.',
        },

        {
          status: 500,

          headers:
            corsHeaders,
        },
      );

    }

  },
);