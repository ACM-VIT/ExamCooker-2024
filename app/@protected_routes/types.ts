import type { Bookmark } from "@/app/actions/Favourites";
import type { Comment, Tag } from "@/src/generated/prisma";

export type ExtendedBookmark = Bookmark & {
  thumbNailUrl?: string | null;
  upvoteCount?: number | null;
  downvoteCount?: number | null;
  createdAt?: Date;
  votes?: { type: "UPVOTE" | "DOWNVOTE" }[];
  author?: { name?: string | null } | null;
  tags?: Tag[];
  comments?: Array<
    Comment & {
      author?: { name?: string | null } | null;
    }
  >;
};
