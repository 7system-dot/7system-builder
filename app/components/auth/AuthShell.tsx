import type {
  ReactNode,
} from 'react';

import {
  Link,
} from '@remix-run/react';

import {
  Bot,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div
      className="min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]"
      style={{
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* LADO ESQUERDO */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{
          backgroundColor: '#080D1A',
        }}
      >
        <div
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              'rgba(212,167,44,0.12)',
          }}
        />

        <div
          className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor:
              'rgba(20,42,92,0.55)',
          }}
        />

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex"
          >
            <img
              src="/logo-dark-styled.png"
              alt="7System Builder"
              className="max-h-14 max-w-[220px] object-contain"
            />
          </Link>
        </div>

        <div
          className="relative z-10 max-w-xl"
        >
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
            style={{
              borderColor:
                'rgba(212,167,44,0.25)',

              backgroundColor:
                'rgba(212,167,44,0.08)',

              color:
                '#F1C75B',
            }}
          >
            <Sparkles size={16} />

            Desenvolvimento com IA
          </div>

          <h2
            className="text-4xl font-bold leading-tight xl:text-5xl"
            style={{
              color: '#FFFFFF',
            }}
          >
            Transforme ideias em
            aplicações completas.
          </h2>

          <p
            className="mt-6 max-w-lg text-lg leading-8"
            style={{
              color: '#94A3B8',
            }}
          >
            Crie sistemas, sites,
            e-commerces e aplicações SaaS
            utilizando inteligência artificial
            com o 7System Builder.
          </p>

          <div
            className="mt-10 grid gap-4"
          >
            <div
              className="flex items-center gap-3"
              style={{
                color: '#CBD5E1',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor:
                    'rgba(212,167,44,0.12)',

                  color:
                    '#F1C75B',
                }}
              >
                <Bot size={20} />
              </div>

              <span>
                Builder integrado com
                inteligência artificial
              </span>
            </div>

            <div
              className="flex items-center gap-3"
              style={{
                color: '#CBD5E1',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor:
                    'rgba(212,167,44,0.12)',

                  color:
                    '#F1C75B',
                }}
              >
                <ShieldCheck size={20} />
              </div>

              <span>
                Projetos protegidos por
                autenticação e banco Supabase
              </span>
            </div>
          </div>
        </div>

        <div
          className="relative z-10 text-sm"
          style={{
            color: '#64748B',
          }}
        >
          7System Builder
        </div>
      </div>

      {/* LADO DIREITO */}
      <div
        className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12"
      >
        <div
          className="w-full max-w-md"
        >
          {/* LOGO MOBILE */}
          <div
            className="mb-10 lg:hidden"
          >
            <Link to="/">
              <div
                className="inline-flex rounded-xl px-4 py-3"
                style={{
                  backgroundColor:
                    '#080D1A',
                }}
              >
                <img
                  src="/logo-dark-styled.png"
                  alt="7System Builder"
                  className="max-h-10 max-w-[180px] object-contain"
                />
              </div>
            </Link>
          </div>

          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                color: '#0B1739',
              }}
            >
              {title}
            </h1>

            <p
              className="mt-3 text-sm leading-6"
              style={{
                color: '#64748B',
              }}
            >
              {subtitle}
            </p>
          </div>

          <div className="mt-8">
            {children}
          </div>

          {footer && (
            <div
              className="mt-8 border-t pt-6 text-center text-sm"
              style={{
                borderColor: '#E2E8F0',
                color: '#64748B',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}