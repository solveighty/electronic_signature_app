interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isVerified?: boolean;
  isAdmin?: boolean;
}

export type { User as default };
