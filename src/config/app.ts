// =============================================================================
// Central app configuration — edit this file when cloning the template.
// Every product built from this template gets its own values here.
// No other file should hardcode app name, description, or nav structure.
// =============================================================================

// ---------------------------------------------------------------------------
// Feature flags
// Set a feature to false to hide its nav links and disable module access.
// ---------------------------------------------------------------------------
export type AppFeatures = {
  /** CRUD module used as the base pattern. Disable when building a fresh domain. */
  entities: boolean;
};

// ---------------------------------------------------------------------------
// Navigation item
// ---------------------------------------------------------------------------
export type NavItem = {
  /** Text shown in the nav link. */
  label: string;
  /** Route path. Must start with /. */
  href: string;
  /**
   * When true the link is only marked active on an exact pathname match.
   * When false (default) it also activates for any sub-path (e.g. /entities/1).
   */
  exact?: boolean;
  /**
   * Optional feature gate. If set, the link is hidden when the feature is disabled.
   * Must be a key of AppFeatures.
   */
  feature?: keyof AppFeatures;
};

// ---------------------------------------------------------------------------
// App config
// ---------------------------------------------------------------------------
export type AppConfig = {
  appName: string;
  appDescription: string;
  /** Navigation rendered in the protected app header. */
  navigation: NavItem[];
  /** Navigation rendered in the public landing page header. */
  publicNavigation: NavItem[];
  features: AppFeatures;
};

export const appConfig: AppConfig = {
  appName: "Template SaaS",
  appDescription:
    "Base reutilizable para construir aplicaciones SaaS. Incluye autenticación, módulos CRUD y arquitectura escalable.",

  navigation: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Entities", href: "/entities", exact: true, feature: "entities" },
    { label: "Buscar", href: "/entities/search", feature: "entities" },
    { label: "Settings", href: "/settings" },
  ],

  publicNavigation: [
    { label: "Inicio", href: "/" },
  ],

  features: {
    entities: true,
  },
};
