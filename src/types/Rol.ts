// Fuente única de verdad: un array que SÍ existe en runtime...
export const ROLES = ["client", "admin"] as const;

// ...y el tipo se deriva de él: "client" | "admin"
export type Rol = (typeof ROLES)[number];

// Type guard: valida en runtime algo que vino de afuera (localStorage, un form)
export const isRol = (value: unknown): value is Rol =>
typeof value === "string" && (ROLES as readonly string[]).includes(value);