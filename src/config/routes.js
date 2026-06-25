/**
 * Mapping centralisé entre clés de navigation (legacy) et chemins URL React Router.
 * Tous les composants continuent d'utiliser navigate("explore") — la conversion se fait ici.
 */

export const ROUTE_PATHS = {
  home: '/',
  login: '/login',
  register: '/register',
  'dashboard-student': '/dashboard/student',
  'dashboard-investor': '/dashboard/investor',
  publish: '/publish',
  explore: '/explore',
  'project-detail': '/projects/:id',
  collaboration: '/collaboration',
  'team-space': '/team-space',
  messages: '/messages',
  notifications: '/notifications',
  'profile-student': '/profile/student',
  'profile-investor': '/profile/investor',
  'saved-projects': '/saved',
  'investor-requests': '/investor-requests',
  admin: '/admin',
  'kyc-verification': '/kyc',
  feed: '/feed',
  badges: '/badges',
  appointments: '/appointments',
  payment: '/payment',
  'due-diligence': '/due-diligence',
  forum: '/forum',
  academy: '/academy',
};

/** Chemins exacts → clé de page (pour navbar active, guards, etc.) */
export const PATH_TO_PAGE = Object.fromEntries(
  Object.entries(ROUTE_PATHS).map(([page, path]) => [path, page])
);

/** Pages accessibles sans connexion */
export const PUBLIC_PAGES = ['home', 'login', 'register', 'project-detail'];

/** Pages sans navbar */
export const AUTH_PAGES = ['login', 'register'];

/** Pages sans sidebar */
export const NO_SIDEBAR_PAGES = [
  'home', 'login', 'register', 'explore', 'project-detail', 'publish',
  'collaboration', 'team-space', 'profile-student', 'profile-investor', 'messages',
];

/** Pages plein écran (sans padding app-main) */
export const FULL_BLEED_PAGES = ['messages', 'home'];

/**
 * Construit l'URL à partir d'une clé de page et d'options contextuelles.
 */
export function getPathForPage(page, opts = {}) {
  if (page === 'project-detail') {
    const projectId = opts.project?.id ?? opts.projectId;
    if (projectId != null) return `/projects/${projectId}`;
    return '/explore';
  }
  return ROUTE_PATHS[page] || '/';
}

/**
 * Déduit la clé de page active depuis le pathname du navigateur.
 */
export function getPageFromPath(pathname) {
  if (pathname.startsWith('/projects/')) return 'project-detail';

  const exact = PATH_TO_PAGE[pathname];
  if (exact) return exact;

  for (const [page, path] of Object.entries(ROUTE_PATHS)) {
    if (path.includes(':')) continue;
    if (pathname.startsWith(path) && path !== '/') return page;
  }

  return 'home';
}

/**
 * Redirection post-login selon le rôle utilisateur.
 */
export function getDashboardPathForRole(role) {
  const map = {
    student: '/dashboard/student',
    investor: '/dashboard/investor',
    admin: '/admin',
  };
  return map[role] || '/';
}

export function getDashboardPageForRole(role) {
  const map = {
    student: 'dashboard-student',
    investor: 'dashboard-investor',
    admin: 'admin',
  };
  return map[role] || 'home';
}
