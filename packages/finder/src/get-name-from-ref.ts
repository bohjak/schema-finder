/**
 * Converts JSON pointer to array of strings path
 *
 * @param ref JSON pointer
 *
 * @example
 * parseRef("#/definitions/field")  // -> ["definitions", "field"]
 */
export const parseRef = (ref?: string) => ref?.split("/").slice(1);

const matchWord = /([A-Z-_]*[a-z]+)/g;
const splitWithSpaces = (m: string) => m.replace(/[-_]/, "") + " ";

const capFirstLetter = ([h, ...t]: string) => {
  h.toUpperCase() + t.join("").toLowerCase();
};

export const getNameFromRef = (ref?: string) => parseRef(ref)?.slice(-1)[0];
// .replace(matchWord, splitWithSpaces)
// .trim()
// .split(" ")
// .map(capFirstLetter)
// .join(" ");
