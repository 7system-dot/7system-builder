import type { ReactNode } from 'react';
import { Link, useLocation } from '@remix-run/react';

import {
  Bot,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  PlusCircle,
  Rocket,
  Settings,
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

const navigation = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: 'Novo Projeto',
    path: '/new-project',
    icon: PlusCircle,
    enabled: true,
  },
  {
    label: 'Meus Projetos',
    path: '/projects',
    icon: FolderKanban,
    enabled: true,
  },
  {
    label: 'Templates',
    path: '/templates',
    icon: LayoutTemplate,
    enabled: true,
  },
  {
    label: 'Builder IA',
    path: '/builder',
    icon: Bot,
    enabled: true,
  },
  {
    label: 'Deploys',
    path: '/deploys',
    icon: Rocket,
    enabled: false,
  },
  {
    label: 'Configurações',
    path: '/settings',
    icon: Settings,
    enabled: false,
  },
];

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <aside
        className="flex w-[260px] shrink-0 flex-col border-r"
        style={{
          backgroundColor: '#080D1A',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="flex h-20 items-center px-6 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <img
            src="/logo-dark-styled.png"
            alt="7System Builder"
            className="max-h-11 max-w-[180px] object-contain"
          />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            if (!item.enabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 opacity-40"
                  style={{ color: '#CBD5E1' }}
                >
                  <Icon size={19} />

                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>

                  <span
                    className="rounded px-2 py-1 text-[10px]"
                    style={{
                      backgroundColor: 'rgba(212,167,44,0.12)',
                      color: '#F1C75B',
                    }}
                  >
                    Em breve
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all"
                style={{
                  backgroundColor: active
                    ? 'rgba(212,167,44,0.14)'
                    : 'transparent',
                  color: active ? '#F1C75B' : '#CBD5E1',
                }}
              >
                <Icon size={19} />

                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className="border-t p-4"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#0B1739' }}
          >
            <div
              className="text-xs font-medium"
              style={{ color: '#94A3B8' }}
            >
              7SYSTEM BUILDER
            </div>

            <div
              className="mt-1 text-sm"
              style={{ color: '#FFFFFF' }}
            >
              Desenvolvimento com IA
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
