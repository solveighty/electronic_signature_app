interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isVerified?: boolean;
}

export type { User as default };
