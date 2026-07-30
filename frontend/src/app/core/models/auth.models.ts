export interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  name: string;
  roles: string[];
}
