export const titleCase = (str: string) =>
  str
    .split(" ")
    .map((s) => `${s[0]?.toUpperCase()}${s.slice(1)}`)
    .join(" ")
