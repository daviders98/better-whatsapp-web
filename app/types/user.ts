import { User } from "firebase/auth";

export type AuthUser = User | null | undefined;

export interface EmbeddedUser {
  email: string;
  photoURL: string | null;
  name?: string | null;
}
