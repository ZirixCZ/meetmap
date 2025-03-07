export type User = {
  relationship?: "NONE" | "PENDING" | "ACCEPTED";
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    friendCount?: number;
    profile_image_url?: string;
  };
};
