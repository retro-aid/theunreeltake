import {
  Film,
  House,
  PersonCircle,
  Send,
  CameraVideo,
} from "react-bootstrap-icons";

export const maxTextInputLength = 100;
export const maxTextAreaLength = 250;

export const allowedPostsPerPage: readonly number[] = [12, 24, 36, 48];

export const publicRouteMetadata = [
  {
    label: "Home",
    href: "/",
    icon: House,
    disabled: false,
    prefetch: true,
  },
  {
    label: "About",
    href: "/about",
    icon: PersonCircle,
    disabled: false,
    prefetch: true,
  },
  {
    label: "Catalog",
    href: "/catalog",
    icon: Film,
    disabled: false,
    prefetch: true,
  },
  {
    label: "Requests",
    href: "/requests",
    icon: Send,
    disabled: false,
    prefetch: true,
  },
];
export const navlinks = [
  {
    label: "Trivia",
    href: "/dashboard/trivia",
    icon: CameraVideo,
    disabled: false,
  },
];
export enum AllowedMediaType {
  Book = "Book",
  Movie = "Movie",
  Tv_Show = "TV Show",
  Game = "Game",
  Music = "Music",
}

export enum AllowedTagType {
  Category = "category",
  Media = "media",
  Informational = "informational",
}

export type PostItem = {
  id: string;
  title: string;
  imageSrc: string;
};
