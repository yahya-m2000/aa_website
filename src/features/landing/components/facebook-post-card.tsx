"use client";

import { FacebookPost } from "@/types/facebook";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ThumbsUp, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface FacebookPostCardProps {
  post: FacebookPost;
}

export function FacebookPostCard({ post }: FacebookPostCardProps) {
  const t = useTranslations("facebookFeed");
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const message = post.message || "";
  const shouldTruncate = message.length > 150;
  const displayMessage = !isExpanded && shouldTruncate
    ? message.slice(0, 150) + "..."
    : message;

  const timeAgo = formatDistanceToNow(new Date(post.created_time), {
    addSuffix: true,
  });

  // Get image from post
  const getPostImage = (): string | null => {
    if (imageError) return null;

    if (post.full_picture) return post.full_picture;

    if (post.attachments?.data?.[0]) {
      const attachment = post.attachments.data[0];
      if (attachment.media?.image?.src) {
        return attachment.media.image.src;
      }
      if (attachment.subattachments?.data?.[0]?.media?.image?.src) {
        return attachment.subattachments.data[0].media.image.src;
      }
    }

    return null;
  };

  const postImage = getPostImage();

  return (
    <a
      href={post.permalink_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col w-full h-full rounded-(--radius) overflow-hidden bg-[rgb(var(--card))]"
    >
      {/* Image */}
      {postImage ? (
        <div className="relative w-full aspect-4/3 overflow-hidden shrink-0">
          <Image
            src={postImage}
            alt="Facebook post"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized // Facebook images are external
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/0 to-black/0" />

          {/* Timestamp chip, echoes the Stats photo-tile treatment */}
          <span className="absolute bottom-3 left-4 text-xs uppercase tracking-widest text-white/90 font-medium">
            {timeAgo}
          </span>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <span className="text-xs uppercase tracking-widest text-[rgb(var(--muted-foreground))] font-medium">
            {timeAgo}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        {message && (
          <div className="flex-1 mb-4 overflow-hidden">
            <p className="text-[rgb(var(--foreground))] leading-relaxed line-clamp-4">
              {displayMessage}
            </p>
            {shouldTruncate && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="text-sm text-[rgb(var(--accent))] font-semibold hover:underline mt-2"
              >
                {isExpanded ? t("showLess") : t("readMore")}
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-[rgb(var(--border))]">
          <div className="flex items-center gap-4">
            {post.reactions?.summary?.total_count ? (
              <div className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                <ThumbsUp className="w-4 h-4" />
                <span className="font-display text-sm font-bold">
                  {post.reactions.summary.total_count.toLocaleString()}
                </span>
              </div>
            ) : null}
            {post.shares?.count ? (
              <div className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                <Share2 className="w-4 h-4" />
                <span className="font-display text-sm font-bold">
                  {post.shares.count.toLocaleString()}
                </span>
              </div>
            ) : null}
          </div>

          <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-[rgb(var(--muted))] transition-colors duration-300 group-hover:bg-[rgb(var(--accent))]">
            <ArrowUpRight className="w-4 h-4 text-[rgb(var(--foreground))] transition-colors duration-300 group-hover:text-[rgb(var(--accent-foreground))]" />
          </span>
        </div>
      </div>
    </a>
  );
}
