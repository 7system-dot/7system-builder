import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  Send,
  UserPlus,
  X,
} from 'lucide-react';

import {
  useOrganization,
} from '~/lib/organizations/OrganizationContext';

import {
  cancelOrganizationInvitation,
  getPendingOrganizationInvitations,
  type OrganizationInvitation,
  sendOrganizationInvitation,
} from '~/lib/organizations/organization-invitation.client';


export function InviteMemberButton() {

  const {
    activeOrganization,
  } =
    useOrganization();


  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    role,
    setRole,
  ] =
    useState<
      'admin' |
      'editor' |
      'viewer'
    >('editor');

  const [
    invitations,
    setInvitations,
  ] =
    useState<
      OrganizationInvitation[]
    >([]);

  const [
    loadingInvitations,
    setLoadingInvitations,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState('');


  async function loadInvitations() {

    try {

      setLoadingInvitations(
        true,
      );

      const result =
        await getPendingOrganizationInvitations(
          activeOrganization.id,
        );

      setInvitations(
        result,
      );

    } catch (error) {

      console.error(
        error,
      );

    } finally {

      setLoadingInvitations(
        false,
      );

    }
  }


  useEffect(() => {

    if (open) {
      void loadInvitations();
    }

  }, [
    open,
    activeOrganization.id,
  ]);


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    if (sending) {
      return;
    }


    setSending(true);

    setErrorMessage('');

    setSuccessMessage('');


    try {

      await sendOrganizationInvitation(

        activeOrganization.id,

        email,

        role,

      );


      setSuccessMessage(
        'Convite enviado com sucesso.',
      );

      setEmail('');

      setRole(
        'editor',
      );

      await loadInvitations();

    } catch (error) {

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o convite.',
      );

    } finally {

      setSending(false);

    }
  }


  async function handleCancel(
    invitationId: string,
  ) {

    try {

      setErrorMessage('');

      await cancelOrganizationInvitation(
        invitationId,
      );

      await loadInvitations();

    } catch (error) {

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível cancelar o convite.',
      );

    }
  }


  return (
    <>

      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold"
        style={{
          borderColor:
            '#D4A72C',

          color:
            '#B88918',

          backgroundColor:
            '#FFFFFF',
        }}
      >
        <UserPlus
          size={18}
        />

        Convidar usuário
      </button>


      {open && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            backgroundColor:
              'rgba(8,13,26,0.70)',
          }}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white"
          >

            <div
              className="flex items-center justify-between border-b p-6"
              style={{
                borderColor:
                  '#E2E8F0',
              }}
            >

              <div>

                <h2
                  className="text-xl font-bold"
                  style={{
                    color:
                      '#0B1739',
                  }}
                >
                  Convidar usuário
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color:
                      '#64748B',
                  }}
                >
                  {
                    activeOrganization.name
                  }
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-lg p-2"
                style={{
                  color:
                    '#64748B',
                }}
              >
                <X size={20} />
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-6"
            >

              {errorMessage && (

                <div
                  className="rounded-xl border p-4 text-sm"
                  style={{
                    borderColor:
                      '#FCA5A5',

                    backgroundColor:
                      '#FEF2F2',

                    color:
                      '#B91C1C',
                  }}
                >
                  {errorMessage}
                </div>

              )}


              {successMessage && (

                <div
                  className="flex items-center gap-2 rounded-xl border p-4 text-sm"
                  style={{
                    borderColor:
                      '#86EFAC',

                    backgroundColor:
                      '#F0FDF4',

                    color:
                      '#166534',
                  }}
                >
                  <CheckCircle2
                    size={18}
                  />

                  {
                    successMessage
                  }
                </div>

              )}


              <div>

                <label
                  htmlFor="inviteEmail"
                  className="mb-2 block text-sm font-semibold"
                  style={{
                    color:
                      '#0B1739',
                  }}
                >
                  E-mail
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{
                      color:
                        '#94A3B8',
                    }}
                  />

                  <input
                    id="inviteEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="usuario@empresa.com.br"
                    className="h-12 w-full rounded-xl border pl-11 pr-4 text-sm outline-none"
                    style={{
                      borderColor:
                        '#CBD5E1',
                    }}
                  />

                </div>

              </div>


              <div>

                <label
                  htmlFor="inviteRole"
                  className="mb-2 block text-sm font-semibold"
                  style={{
                    color:
                      '#0B1739',
                  }}
                >
                  Função
                </label>

                <select
                  id="inviteRole"
                  value={role}
                  onChange={(
                    event,
                  ) =>
                    setRole(
                      event.target.value as
                        'admin' |
                        'editor' |
                        'viewer',
                    )
                  }
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none"
                  style={{
                    borderColor:
                      '#CBD5E1',
                  }}
                >
                  <option
                    value="admin"
                  >
                    Administrador
                  </option>

                  <option
                    value="editor"
                  >
                    Editor
                  </option>

                  <option
                    value="viewer"
                  >
                    Visualizador
                  </option>
                </select>

              </div>


              <button
                type="submit"
                disabled={
                  sending
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold disabled:opacity-60"
                style={{
                  backgroundColor:
                    '#D4A72C',

                  color:
                    '#080D1A',
                }}
              >

                {sending ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={18} />

                    Enviar convite
                  </>
                )}

              </button>

            </form>


            <div
              className="border-t p-6"
              style={{
                borderColor:
                  '#E2E8F0',
              }}
            >

              <h3
                className="font-bold"
                style={{
                  color:
                    '#0B1739',
                }}
              >
                Convites pendentes
              </h3>


              {loadingInvitations ? (

                <div className="py-6 text-center">

                  <LoaderCircle
                    size={24}
                    className="mx-auto animate-spin"
                    style={{
                      color:
                        '#D4A72C',
                    }}
                  />

                </div>

              ) : invitations.length ===
                0 ? (

                <p
                  className="mt-4 text-sm"
                  style={{
                    color:
                      '#64748B',
                  }}
                >
                  Nenhum convite pendente.
                </p>

              ) : (

                <div className="mt-4 space-y-3">

                  {invitations.map(
                    (
                      invitation,
                    ) => (

                      <div
                        key={
                          invitation.id
                        }
                        className="flex items-center justify-between gap-4 rounded-xl border p-4"
                        style={{
                          borderColor:
                            '#E2E8F0',
                        }}
                      >

                        <div>

                          <div
                            className="font-semibold"
                            style={{
                              color:
                                '#0B1739',
                            }}
                          >
                            {
                              invitation.email
                            }
                          </div>

                          <div
                            className="mt-1 flex items-center gap-2 text-xs"
                            style={{
                              color:
                                '#64748B',
                            }}
                          >
                            <Clock3
                              size={13}
                            />

                            {
                              invitation.role
                            }
                          </div>

                        </div>


                        <button
                          type="button"
                          onClick={() => {
                            void handleCancel(
                              invitation.id,
                            );
                          }}
                          className="text-xs font-semibold"
                          style={{
                            color:
                              '#DC2626',
                          }}
                        >
                          Cancelar
                        </button>

                      </div>

                    ),
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </>
  );
}