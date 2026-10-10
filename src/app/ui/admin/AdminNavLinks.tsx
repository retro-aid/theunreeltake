"use client";

import { NavLink, Text } from "@mantine/core";
import classes from "@/app/ui/admin/NavbarSimple.module.css";
import { useContext } from "react";
import {
  BarChartLine,
  CameraVideo,
  ChatLeftDots,
  FileRichtext,
  House,
  People,
  Send,
  Tag,
  Postcard,
  Newspaper,
} from "react-bootstrap-icons";
import { usePathname } from "next/navigation";
import { AuthContext } from "./AuthContext";

const data = [
  {
    link: "/dashboard",
    label: "Dashboard",
    icon: House,
    disabled: false,
    adminOnly: false,
  },
  {
    link: "/dashboard/posts",
    label: "Posts",
    icon: FileRichtext,
    disabled: false,
    adminOnly: false,
  },
  {
    link: "/dashboard/templates",
    label: "Templates",
    icon: Postcard,
    disabled: false,
    adminOnly: false,
  },
  {
    link: "/dashboard/comments",
    label: "Comments",
    icon: ChatLeftDots,
    disabled: false,
    adminOnly: false,
  },
  {
    link: "/dashboard/trivia",
    label: "Trivia",
    icon: CameraVideo,
    disabled: false,
    adminOnly: false,
  },
  {
    link: "/dashboard/requests",
    label: "Requests",
    icon: Send,
    disabled: false,
    adminOnly: true,
  },
  {
    link: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChartLine,
    disabled: true,
    adminOnly: false,
  },
  {
    link: "/dashboard/tags",
    label: "Tags",
    icon: Tag,
    disabled: false,
    adminOnly: true,
  },
  {
    link: "/dashboard/users",
    label: "Users",
    icon: People,
    disabled: false,
    adminOnly: true,
  },
  {
    link: "/dashboard/newsletter",
    label: "Newsletter",
    icon: Newspaper,
    disabled: false,
    adminOnly: true,
  },
];

/**
 * Creates the UI component for the dashboard navigation links. Some of the links are only rendered if the user is an admin.
 * @returns renders the user navigation links
 */
export default function AdminNavLinks() {
  const pathname = usePathname();

  const authContext = useContext(AuthContext);
  let isAdmin = false;
  if (authContext.user.role == "admin") isAdmin = true;

  return (
    <>
      {data.map((item) => {
        if (!isAdmin && item.adminOnly) {
          return null;
        } else {
          return (
            <NavLink
              className={classes.link}
              disabled={item.disabled}
              leftSection={<item.icon size={22} />}
              label={<Text fw={500}>{item.label}</Text>}
              active={item.link === pathname}
              href={item.link}
              key={item.label}
            />
          );
        }
      })}
    </>
  );
}
