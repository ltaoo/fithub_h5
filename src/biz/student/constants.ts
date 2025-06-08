export enum HumanGenderType {
  Male = 1,
  Female = 2,
  Unknown = 3,
}

export const Avatars = [
  "a1.jpeg",
  "a2.jpeg",
  "a3.jpeg",
  "a4.jpeg",
  "a5.jpeg",
  "a6.jpeg",
  "a7.jpeg",
  "a8.jpeg",
  "a9.jpeg",
  "a10.jpeg",
  "a11_1.jpeg",
  "a12.jpeg",
  "a13.jpeg",
  "a14.jpeg",
  "a15_1.jpeg",
  "a16_1.jpeg",
  "a17_1.jpeg",
  "a18_1.jpeg",
  "a19.jpeg",
  "a20.jpeg",
  "a21.jpeg",
  "a22.jpeg",
  "a23.jpeg",
  "a24.jpeg",
].map((key, idx) => {
  return {
    id: idx + 1,
    key,
    url: `//static.fithub.top/avatars/${key}`,
  };
});
