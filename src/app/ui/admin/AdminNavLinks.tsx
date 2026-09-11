'use client';

import {NavLink, Text} from "@mantine/core";
import classes from "@/app/ui/admin/NavbarSimple.module.css";
import React from "react";
import {
  BarChartLine,
  CameraVideo,
  ChatLeftDots,
  FileRichtext,
  House,
  Journal,
  People,
  Send,
  Tag,
  Postcard
} from "react-bootstrap-icons";
import {usePathname} from "next/navigation";

const data = [
  { link: '/dashboard', label: 'Dashboard', icon: House, disabled: false},
  { link: '/dashboard/posts', label: 'Posts', icon: FileRichtext, disabled: false},
  { link: '/dashboard/drafts', label: 'Drafts', icon: Journal, disabled: false},
  { link: '/dashboard/templates', label: 'Templates', icon: Postcard, disabled: false},
  { link: '/dashboard/comments', label: 'Comments', icon: ChatLeftDots, disabled: true},
  { link: '/dashboard/trivia', label: 'Trivia', icon: CameraVideo, disabled: false},
  { link: '/dashboard/requests', label: 'Requests', icon: Send, disabled: false},
  { link: '/dashboard/analytics', label: 'Analytics', icon: BarChartLine, disabled: true},
  { link: '/dashboard/tags', label: 'Tags', icon: Tag, disabled: false},
  { link: '/dashboard/users', label: 'Users', icon: People, disabled: false},
];

export default function AdminNavLinks() {

  const pathname = usePathname();

  return (
    <>
      {
        data.map((item) =>
          <NavLink
            className={classes.link}
            disabled={item.disabled}
            leftSection={<item.icon size={22}/>}
            label={<Text fw={500}>{item.label}</Text>}
            active={item.link === pathname}
            href={item.link}
            key={item.label}
          />
        )
      }
    </>
  );
}