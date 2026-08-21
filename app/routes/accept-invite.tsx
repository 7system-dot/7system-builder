import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useSearchParams,
} from '@remix-run/react';

import {
  Building2,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  XCircle,
} from 'lucide-react';

import {
  AuthShell,
} from '~/components/auth/AuthShell';

import {
  completeAuthRedirect,
  getCurrentUser,
  updatePassword,
} from '~/lib/auth/auth.client';

import {
  acceptOrganizationInvitation,
} from '~/lib/organizations/organization-invitation.client';

import {
  setActiveOrganization,
} from '~/lib/organizations/organization.client';


type Status =
  | 'loading'
  | 'success'
  | 'error';


export default function AcceptInvite() {

  const [
    searchParams,
  ] =
    useSearchParams();

  const [
    status,
    setStatus,
  ] =
    useState<Status>(
      'loading',
    );

  const [
    organizationName,
    setOrganizationName,
  ] =
    useState('');

  const [
    role,
    setRole,
  ] =
    useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('');

  const [
    savingPassword,
    setSavingPassword,
  ] =
    useState(false);

  const [
    passwordSaved,
    setPasswordSaved,
  ] =
    useState(false);


  useEffect(() => {

    let active = true;


    async function accept() {

      try {

        const invitationId =
          searchParams.get(
            'invitation',
          );


        if (!invitationId) {

          throw new Error(
            'Código do convite não encontrado.',
          );

        }


        await completeAuthRedirect();


        const user =
          await getCurrentUser();


        if (!user) {

          throw new Error(
            'Não foi possível identificar o usuário do convite.',
          );

        }


        const result =
          await acceptOrganizationInvitation(
            invitationId,
          );


        /*
         * Seleciona automaticamente
         * a empresa recém-aceita.
         */
        await setActiveOrganization(
          result.organizationId,
        );


        if (!active) {
          return;
        }


        setOrganizationName(
          result.organizationName,
        );

        setRole(
          result.role,
        );

        setStatus(
          'success',
        );

      } catch (error) {

        console.error(
          error,
        );


        if (!active) {
          return;
        }


        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível aceitar o convite.',
        );

        setStatus(
          'error',
        );

      }

    }


    void accept();


    return () => {
      active = false;
    };

  }, [
    searchParams,
  ]);


  async function handlePassword(
    event:
      FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();


    if (
      password.length < 8
    ) {

      setErrorMessage(
        'A senha deve possuir pelo menos 8 caracteres.',
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {

      setErrorMessage(
        'As senhas não são iguais.',
      );

      return;
    }


    setSavingPassword(
      true,
    );

    setErrorMessage('');


    try {

      await updatePassword(
        password,
      );

      setPasswordSaved(
        true,
      );

      setPassword('');

      setConfirmPassword('');

    } catch (error) {

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível definir a senha.',
      );

    } finally {

      setSavingPassword(
        false,
      );

    }
  }


  if (
    status === 'loading'
  ) {

    return (
      <AuthShell
        title="Aceitando convite"
        subtitle="Estamos validando seu acesso à organização."
      >
        <div
          className="rounded-2xl border bg-white p-8 text-center"
          style={{
            borderColor:
              '#E2E8F0',
          }}
        >
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin"
            style={{
              color:
                '#D4A72C',
            }}
          />

          <p
            className="mt-4 text-sm"
            style={{
              color:
                '#64748B',
            }}
          >
            Validando convite...
          </p>
        </div>
      </AuthShell>
    );

  }


  if (
    status === 'error'
  ) {

    return (
      <AuthShell
        title="Convite não aceito"
        subtitle="Não foi possível concluir este convite."
      >
        <div
          className="rounded-2xl border p-7 text-center"
          style={{
            borderColor:
              '#FCA5A5',

            backgroundColor:
              '#FEF2F2',
          }}
        >
          <XCircle
            size={44}
            className="mx-auto"
            style={{
              color:
                '#DC2626',
            }}
          />

          <p
            className="mt-4 text-sm leading-6"
            style={{
              color:
                '#991B1B',
            }}
          >
            {errorMessage}
          </p>

          <Link
            to="/login"
            className="mt-6 flex h-12 items-center justify-center rounded-xl font-semibold"
            style={{
              backgroundColor:
                '#D4A72C',

              color:
                '#080D1A',
            }}
          >
            Ir para o Login
          </Link>
        </div>
      </AuthShell>
    );

  }


  return (
    <AuthShell
      title="Convite aceito"
      subtitle="Sua conta agora possui acesso à organização."
    >

      <div
        className="rounded-2xl border p-6"
        style={{
          borderColor:
            '#86EFAC',

          backgroundColor:
            '#F0FDF4',
        }}
      >

        <CheckCircle2
          size={44}
          style={{
            color:
              '#16A34A',
          }}
        />

        <h2
          className="mt-4 text-xl font-bold"
          style={{
            color:
              '#166534',
          }}
        >
          Acesso liberado
        </h2>

        <div
          className="mt-5 rounded-xl bg-white p-4"
        >

          <div
            className="flex items-center gap-2 font-semibold"
            style={{
              color:
                '#0B1739',
            }}
          >
            <Building2
              size={18}
            />

            {organizationName}
          </div>

          <div
            className="mt-2 text-sm"
            style={{
              color:
                '#64748B',
            }}
          >
            Permissão: {role}
          </div>

        </div>

      </div>


      {!passwordSaved && (

        <form
          onSubmit={
            handlePassword
          }
          className="mt-6 space-y-4 rounded-2xl border bg-white p-6"
          style={{
            borderColor:
              '#E2E8F0',
          }}
        >

          <div>

            <div
              className="flex items-center gap-2 font-bold"
              style={{
                color:
                  '#0B1739',
              }}
            >
              <KeyRound
                size={18}
              />

              Definir senha
            </div>

            <p
              className="mt-2 text-xs leading-5"
              style={{
                color:
                  '#64748B',
              }}
            >
              Se esta é sua primeira conta
              no 7System Builder, defina uma
              senha antes de continuar. Se
              você já possuía uma conta,
              pode ignorar esta etapa.
            </p>

          </div>


          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(
              event,
            ) =>
              setPassword(
                event.target.value,
              )
            }
            placeholder="Nova senha — mínimo 8 caracteres"
            className="h-12 w-full rounded-xl border px-4 text-sm"
            style={{
              borderColor:
                '#CBD5E1',
            }}
          />


          <input
            type="password"
            minLength={8}
            value={
              confirmPassword
            }
            onChange={(
              event,
            ) =>
              setConfirmPassword(
                event.target.value,
              )
            }
            placeholder="Confirmar senha"
            className="h-12 w-full rounded-xl border px-4 text-sm"
            style={{
              borderColor:
                '#CBD5E1',
            }}
          />


          <button
            type="submit"
            disabled={
              savingPassword
            }
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold disabled:opacity-60"
            style={{
              backgroundColor:
                '#0B1739',

              color:
                '#FFFFFF',
            }}
          >
            {savingPassword
              ? 'Salvando...'
              : 'Definir senha'}
          </button>

        </form>

      )}


      {passwordSaved && (

        <div
          className="mt-6 rounded-xl border p-4 text-sm"
          style={{
            borderColor:
              '#86EFAC',

            backgroundColor:
              '#F0FDF4',

            color:
              '#166534',
          }}
        >
          Senha definida com sucesso.
        </div>

      )}


      {errorMessage && (

        <div
          className="mt-5 rounded-xl border p-4 text-sm"
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


      <Link
        to="/"
        className="mt-6 flex h-12 items-center justify-center rounded-xl font-semibold"
        style={{
          backgroundColor:
            '#D4A72C',

          color:
            '#080D1A',
        }}
      >
        Entrar no 7System Builder
      </Link>

    </AuthShell>
  );
}