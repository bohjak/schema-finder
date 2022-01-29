import {} from "./internal";
import {isJsonSchemaKeyword} from "./validation-keywords";

export const showName = (key: string): boolean => {
  return !Number.isNaN(Number.parseInt(key)) || isJsonSchemaKeyword(key);
};
