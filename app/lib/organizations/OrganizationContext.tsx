import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Building2,
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react';

import {
  type ActiveOrganization,
  getActiveOrganization,
  getOrganizationsForCurrentUser,
  setActiveOrganization,
} from './organization.client';

interface OrganizationContextValue {
  organizations:
    ActiveOrganization[];

  activeOrganization:
    ActiveOrganization;

  loading:
    boolean;

  switchOrganization: (
    organizationId: string,
  ) => Promise<void>;

  refreshOrganizations:
    () => Promise<void>;
}

const OrganizationContext =
  createContext<
    OrganizationContextValue |
    undefined
  >(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({
  children,
}: OrganizationProviderProps) {
  const [
    organizations,
    setOrganizations,
  ] =
    useState<
      ActiveOrganization[]
    >([]);

  const [
    activeOrganization,
    setCurrentOrganization,
  ] =
    useState<
      ActiveOrganization |
      null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  async function loadOrganizations() {
    try {
      setLoading(true);
      setErrorMessage('');

      const availableOrganizations =
        await getOrganizationsForCurrentUser();

      const active =
        await getActiveOrganization();

      setOrganizations(
        availableOrganizations,
      );

      setCurrentOrganization(
        active,
      );

      if (!active) {
        setErrorMessage(
          'Sua conta ainda não possui uma organização ativa.',
        );
      }
    } catch (error) {
      console.error(
        'Erro ao carregar organização:',
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar sua organização.',
      );

      setCurrentOrganization(
        null,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrganizations();
  }, []);

  async function switchOrganization(
    organizationId: string,
  ) {
    setLoading(true);
    setErrorMessage('');

    try {
      const organization =
        await setActiveOrganization(
          organizationId,
        );

      setCurrentOrganization(
        organization,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível trocar de organização.',
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }

  const contextValue =
    useMemo(
      () => {
        if (!activeOrganization) {
          return null;
        }

        return {
          organizations,
          activeOrganization,
          loading,
          switchOrganization,
          refreshOrganizations:
            loadOrganizations,
        };
      },
      [
        organizations,
        activeOrganization,
        loading,
      ],
    );

  /*
   * CARREGANDO TENANT
   */
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor:
            '#F8FAFC',
        }}
      >
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin"
            style={{
              color:
                '#D4A72C',
            }}
          />

          <div
            className="mt-4 text-sm font-semibold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Carregando sua empresa...
          </div>
        </div>
      </div>
    );
  }

  /*
   * SEM TENANT / ERRO
   */
  if (
    errorMessage ||
    !contextValue
  ) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{
          backgroundColor:
            '#F8FAFC',
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl border bg-white p-8 text-center"
          style={{
            borderColor:
              '#E2E8F0',
          }}
        >
          <ShieldAlert
            size={44}
            className="mx-auto"
            style={{
              color:
                '#DC2626',
            }}
          />

          <h1
            className="mt-5 text-xl font-bold"
            style={{
              color:
                '#0B1739',
            }}
          >
            Organização não disponível
          </h1>

          <p
            className="mt-3 text-sm leading-6"
            style={{
              color:
                '#64748B',
            }}
          >
            {errorMessage ||
              'Sua conta não possui uma organização ativa.'}
          </p>

          <div
            className="mt-6 flex items-center justify-center gap-2 text-sm"
            style={{
              color:
                '#B88918',
            }}
          >
            <Building2
              size={18}
            />

            7System Builder
          </div>
        </div>
      </div>
    );
  }

  return (
    <OrganizationContext.Provider
      value={contextValue}
    >
      {children}
    </OrganizationContext.Provider>
  );
}


export function useOrganization():
  OrganizationContextValue {
  const context =
    useContext(
      OrganizationContext,
    );

  if (!context) {
    throw new Error(
      'useOrganization deve ser usado dentro de OrganizationProvider.',
    );
  }

  return context;
}