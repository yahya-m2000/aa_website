"use client";

import React, { useEffect, useState } from "react";
import { FacebookPost } from "@/types/facebook";
import { FacebookPostCard } from "./facebook-post-card";
import { Facebook, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useTranslations } from "next-intl";

export function FacebookFeedCustom() {
  const t = useTranslations("facebookFeed");
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/facebook/posts');

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching Facebook posts:', err);
      setError('Unable to load Facebook posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    if (posts.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % Math.min(posts.length, 6));
    }, 5000);

    return () => clearInterval(interval);
  }, [posts.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-12 h-12 border-4 border-[rgb(var(--primary))] border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Loading latest posts from Facebook...
        </p>
      </div>
    );
  }

  // Error state
  if (error || posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgb(var(--muted))] mb-4">
          <AlertCircle className="w-8 h-8 text-[rgb(var(--muted-foreground))]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {error || "No posts available"}
        </h3>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4 max-w-sm mx-auto">
          {error
            ? "We couldn't load the Facebook feed. Please visit our page directly."
            : "Check back soon for our latest updates!"}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={fetchPosts}
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            asChild
            variant="default"
          >
            <a
              href="https://www.facebook.com/aatradesolutions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Facebook className="w-4 h-4" />
              Visit Facebook Page
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Posts carousel
  const displayPosts = posts.slice(0, 6);
  return (
    <div className="space-y-6">
      {/* Carousel container */}
      <div className="relative w-full py-8" style={{ minHeight: '500px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {displayPosts.map((post, index) => {
            const offset = index - activeIndex;
            const isActive = offset === 0;
            const isAdjacent = Math.abs(offset) === 1;
            const isVisible = Math.abs(offset) <= 1;

            return (
              <div
                key={post.id}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  transform: `translateX(${offset * 420}px) scale(${isActive ? 1 : 0.75})`,
                  opacity: isActive ? 1 : isAdjacent ? 0.4 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                  width: '480px',
                  height: '450px',
                  left: '50%',
                  marginLeft: '-240px',
                  zIndex: isActive ? 20 : 0,
                }}
              >
                <div className="w-full h-full">
                  <FacebookPostCard post={post} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Left gradient fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)'
          }}
        />

        {/* Right gradient fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)'
          }}
        />
      </div>

      {/* Dot indicators */}
      {displayPosts.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {displayPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="transition-all duration-300"
              style={{
                width: activeIndex === index ? '32px' : '8px',
                height: '8px',
                backgroundColor: activeIndex === index
                  ? 'rgb(var(--primary))'
                  : 'rgb(var(--muted-foreground))',
                opacity: activeIndex === index ? 1 : 0.3,
                borderRadius: 0,
              }}
              aria-label={`Go to post ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* View more button */}
      {posts.length > 0 && (
        <div className="text-center pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <a
              href="https://www.facebook.com/aatradesolutions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Facebook className="w-4 h-4" />
              {t("viewAllPosts")}
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
