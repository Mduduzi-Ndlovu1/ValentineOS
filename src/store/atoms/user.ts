import { atom } from "jotai";

export type UserName = "Mduduzi" | "Neo";

export const currentUserAtom = atom<UserName | null>(null);
