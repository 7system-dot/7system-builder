import {
  useEffect,
  useState,
} from 'react';

import type { MetaFunction } from '@remix-run/cloudflare';

import {
  CheckCircle2,
  Database,
  LoaderCircle,
  XCircle,
} from 'lucide-react';

import { AppShell } from '~/components/dashboard/AppShell';

import {
  getSupabaseClient,
} from '~/lib/supabase/supabase.client';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Teste Supabase | 7System Builder',
    },
  ];
};

type TestStatus =
  | 'loading'
  | 'success'
  | 'error';

export default function SupabaseTest() {
  const [status, setStatus] =
    useState<TestStatus>('loading');

  const [message, setMessage] =
    useState('Conectando ao Supabase...');

  const [userId, setUserId] =
    useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase =
          getSupabaseClient();

        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        let user =
          sessionData.session?.user ?? null;

        if (!user) {
          const {
            data,
            error,
          } =
            await supabase.auth.signInAnonymously();

          if (error) {
            throw error;
          }

          user = data.user;
        }

        if (!user) {
          throw new Error(
            'Não foi possível obter o usuário.',
          );
        }

        setUserId(user.id);

        const {
          data: projects,
          error: projectError,
        } = await supabase
          .from('builder_projects')
          .select('id, name')
          .limit(1);

        if (projectError) {
          throw projectError;
        }

        setStatus('success');

        setMessage(
          `Supabase conectado. Projetos encontrados: ${
            projects?.length ?? 0
          }`,
        );
      } catch (error) {
        console.error(error);

        setStatus('error');

        setMessage(
          error instanceof Error
            ? error.message
            : 'Erro desconhecido ao conectar.',
        );
      }
    }

    void testConnection();
  }, []);

  return (
    <AppShell>
      <div
        className="min-h-screen p-8"
        style={{
          backgroundColor: '#F8FAFC',
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-2xl border p-8"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
            }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor:
                  'rgba(212,167,44,0.12)',
                color: '#B88918',
              }}
            >
              <Database size={28} />
            </div>

            <h1
              className="mt-6 text-2xl font-bold"
              style={{
                color: '#0B1739',
              }}
            >
              Teste de conexão Supabase
            </h1>

            <div className="mt-8 flex items-center gap-3">
              {status === 'loading' && (
                <LoaderCircle
                  className="animate-spin"
                  size={24}
                  style={{
                    color: '#B88918',
                  }}
                />
              )}

              {status === 'success' && (
                <CheckCircle2
                  size={26}
                  style={{
                    color: '#16A34A',
                  }}
                />
              )}

              {status === 'error' && (
                <XCircle
                  size={26}
                  style={{
                    color: '#DC2626',
                  }}
                />
              )}

              <span
                className="font-semibold"
                style={{
                  color:
                    status === 'error'
                      ? '#DC2626'
                      : '#0B1739',
                }}
              >
                {message}
              </span>
            </div>

            {userId && (
              <div
                className="mt-8 rounded-xl p-5"
                style={{
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div
                  className="text-xs font-bold uppercase"
                  style={{
                    color: '#64748B',
                  }}
                >
                  Usuário Supabase
                </div>

                <div
                  className="mt-2 break-all font-mono text-sm"
                  style={{
                    color: '#0B1739',
                  }}
                >
                  {userId}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}