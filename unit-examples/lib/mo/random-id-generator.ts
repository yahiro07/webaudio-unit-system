import { seqNumbers } from "../ax/array-utils";

const randomIdChars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function generateRandomId(n: number) {
  return seqNumbers(n)
    .map(() =>
      randomIdChars.charAt((Math.random() * randomIdChars.length) >>> 0),
    )
    .join("");
}
