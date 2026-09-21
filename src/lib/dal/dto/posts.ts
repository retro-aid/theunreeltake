export type PostDTO = {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PostEditDTO = {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  posterUrl: string | null;
  published: boolean;
  mediaTagId: number;
};