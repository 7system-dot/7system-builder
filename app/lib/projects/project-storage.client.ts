export type ProjectType =
  | 'saas'
  | 'ecommerce'
  | 'site'
  | 'catalog'
  | 'pdv'
  | 'custom';

export type ProjectStatus =
  | 'draft'
  | 'building'
  | 'published';

export interface ProjectRecord {
  id: string;
  name: string;
  type: ProjectType;
  description: string;

  useSupabase: boolean;
  responsive: boolean;

  status: ProjectStatus;

  createdAt: string;
  updatedAt: string;

  lastPrompt?: string;
}

export interface SaveProjectInput {
  id?: string;

  name: string;
  type: ProjectType;
  description: string;

  useSupabase: boolean;
  responsive: boolean;

  status: ProjectStatus;

  lastPrompt?: string;
}

const STORAGE_KEY = '7system-builder.projects';

function isBrowser() {
  return typeof window !== 'undefined';
}

function createId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function getProjects(): ProjectRecord[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const projects = JSON.parse(raw) as ProjectRecord[];

    if (!Array.isArray(projects)) {
      return [];
    }

    return projects.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime(),
    );
  } catch {
    return [];
  }
}

function persistProjects(projects: ProjectRecord[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects),
  );
}

export function getProjectById(
  id: string,
): ProjectRecord | undefined {
  return getProjects().find(
    (project) => project.id === id,
  );
}

export function saveProject(
  input: SaveProjectInput,
): ProjectRecord {
  const projects = getProjects();

  const existingProject = input.id
    ? projects.find((project) => project.id === input.id)
    : undefined;

  const now = new Date().toISOString();

  const project: ProjectRecord = {
    id: existingProject?.id ?? createId(),

    name: input.name.trim(),
    type: input.type,
    description: input.description.trim(),

    useSupabase: input.useSupabase,
    responsive: input.responsive,

    status: input.status,

    createdAt:
      existingProject?.createdAt ?? now,

    updatedAt: now,

    lastPrompt: input.lastPrompt,
  };

  const updatedProjects = existingProject
    ? projects.map((item) =>
        item.id === project.id ? project : item,
      )
    : [project, ...projects];

  persistProjects(updatedProjects);

  return project;
}

export function deleteProject(id: string) {
  const projects = getProjects().filter(
    (project) => project.id !== id,
  );

  persistProjects(projects);
}

export function updateProjectStatus(
  id: string,
  status: ProjectStatus,
) {
  const project = getProjectById(id);

  if (!project) {
    return;
  }

  saveProject({
    ...project,
    status,
  });
}

export const projectTypeLabels: Record<
  ProjectType,
  string
> = {
  saas: 'SaaS',
  ecommerce: 'E-commerce',
  site: 'Site',
  catalog: 'Catálogo',
  pdv: 'PDV',
  custom: 'Personalizado',
};

export const projectStatusLabels: Record<
  ProjectStatus,
  string
> = {
  draft: 'Rascunho',
  building: 'Em desenvolvimento',
  published: 'Publicado',
};
