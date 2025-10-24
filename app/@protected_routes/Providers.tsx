"use client";

import React from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import ClientSide from "./clientSide";
import BookmarksProvider from "@/app/components/BookmarksProvider";
import type { ExtendedBookmark } from "./types";

interface ProvidersProps {
  session: Session;
  initialBookmarks: ExtendedBookmark[];
  children: React.ReactNode;
}

export default function Providers({
  session,
  initialBookmarks,
  children,
}: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ClientSide>
        <BookmarksProvider initialBookmarks={initialBookmarks}>
          {children}
        </BookmarksProvider>
      </ClientSide>
    </SessionProvider>
  );
}
