"use client";

import { FacebookPost } from "@/types/facebook";
import { formatDistanceToNow } from "date-fns";
import { Facebook, ExternalLink, ThumbsUp, Share2 } from "lucide-react";
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
    <div className="group bg-white border border-[rgb(var(--border))] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col w-full h-full">
      {/* Image */}
      {postImage && (
        <div className="relative w-full h-[200px] bg-[rgb(var(--muted))] overflow-hidden flex-shrink-0">
          <Image
            src={postImage}
            alt="Facebook post"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized // Facebook images are external
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        {/* Message */}
        {message && (
          <div className="flex-1 mb-3 overflow-hidden">
            <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed line-clamp-4">
              {displayMessage}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-[rgb(var(--primary))] hover:underline mt-2"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Engagement Stats */}
        {(post.reactions || post.shares) && (
          <div className="flex items-center gap-4 mb-3 pb-3 border-b border-[rgb(var(--border))]">
            {post.reactions?.summary?.total_count ? (
              <div className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {post.reactions.summary.total_count.toLocaleString()}
                </span>
              </div>
            ) : null}
            {post.shares?.count ? (
              <div className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {post.shares.count.toLocaleString()}
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--border))] mt-auto flex-shrink-0">
          <span className="text-xs text-[rgb(var(--muted-foreground))]">
            {timeAgo}
          </span>
          <a
            href={post.permalink_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary))]/80 transition-colors"
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>{t("viewOnFacebook")}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
