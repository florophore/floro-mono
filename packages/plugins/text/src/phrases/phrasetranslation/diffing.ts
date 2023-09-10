
import mdiff from "mdiff";

export type StringDiff = {
  add: {
    [key: number]: string;
  };
  remove: {
    [key: number]: string;
  };
};

export const splitTextForDiff = (str: string): Array<string> => {
  let chars = str;
  const sentences = str.split(/[\.!\?。]/g).filter((v) => v != "");
  for (let i = 0; i < sentences.length; ++i) {
    sentences[i] =
      sentences[i] + (chars.substring?.(sentences[i].length)?.[0] ?? "");
    chars = chars.substring(sentences[i].length);
  }
  return sentences;
};


export const splitTextForUriDiff = (str: string): Array<string> => {
  return str.split(/\//g).filter((v) => v != "");
};

export const getLCS = (
  left: Array<string>,
  right: Array<string>
): Array<string> => {
  const diff = mdiff(left, right);
  const lcs = diff.getLcs();
  return lcs ?? [];
};

export const getArrayStringDiff = (
  past: Array<string>,
  present: Array<string>
): StringDiff => {
  const longestSequence = getLCS(past, present);

  let diff = {
    add: {},
    remove: {},
  };

  for (let i = 0, removeIndex = 0; i < past.length; ++i) {
    if (longestSequence[removeIndex] == past[i]) {
      removeIndex++;
    } else {
      diff.remove[i] = past[i];
    }
  }

  for (let i = 0, addIndex = 0; i < present.length; ++i) {
    if (longestSequence[addIndex] == present[i]) {
      addIndex++;
    } else {
      diff.add[i] = present[i];
    }
  }
  return diff;
};