"use client";

import { useEffect, useState } from "react";
import { FacebookPost } from "@/types/facebook";
import { FacebookPostCard } from "./facebook-post-card";
import { Facebook, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useTranslations } from "next-intl";
import { socialLinks } from "@/shared/data";

export function FacebookFeedCustom() {
  const t = useTranslations("facebookFeed");
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(false);

      const response = await fetch("/api/facebook/posts");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Error fetching Facebook posts:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgb(var(--muted))] mb-4">
          <div className="w-6 h-6 rounded-full border-2 border-[rgb(var(--foreground))] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgb(var(--muted))] mb-5">
          <AlertCircle className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
        </div>
        <h3 className="font-display text-lg font-bold mb-2">
          {error ? t("errorDescription") : t("noPosts")}
        </h3>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6 max-w-sm mx-auto">
          {error ? t("noPostsDescription") : t("noPostsDescription")}
        </p>
        <div className="flex gap-3 justify-center">
          {error && (
            <Button
              onClick={fetchPosts}
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t("tryAgain")}
            </Button>
          )}
          <Button asChild variant="default" size="sm">
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Facebook className="w-4 h-4" />
              {t("visitPage")}
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const displayPosts = posts.slice(0, 3);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPosts.map((post) => (
          <FacebookPostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="text-center">
        <Button asChild variant="outline">
          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Facebook className="w-4 h-4" />
            {t("viewAllPosts")}
          </a>
        </Button>
      </div>
    </div>
  );
}
