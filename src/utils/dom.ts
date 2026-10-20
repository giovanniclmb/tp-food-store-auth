/**
 * Busca un elemento por id y verifica en runtime que sea del tipo esperado.
 * Reemplaza al `as HTMLInputElement`, que no verifica nada.
 */
export const getElement = <T extends HTMLElement>(
  id: string,
  type: new () => T
): T => {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`#${id} no existe o no es un ${type.name}`);
  }
  return element;
};