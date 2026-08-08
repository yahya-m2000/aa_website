'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/core/utils';
import { TOUR_SCENES } from './beats';
import { Spotlight } from './spotlight';
import { DashboardScene } from './scenes/dashboard-scene';
import { OrdersListScene } from './scenes/orders-list-scene';
import { OrderDetailScene, type Stage } from './scenes/order-detail-scene';
import type { SceneId } from './types';

const SCENE_ORDER: SceneId[] = ['dashboard', 'orders-list', 'order-detail'];

function SceneStage({ sceneId, orderStage }: { sceneId: SceneId; orderStage: Stage }) {
  switch (sceneId) {
    case 'dashboard':
      return <DashboardScene />;
    case 'orders-list':
      return <OrdersListScene />;
    case 'order-detail':
      return <OrderDetailScene stage={orderStage} />;
  }
}

/**
 * Full-screen guided tour: fades between three mock "scenes" (Dashboard, Orders list,
 * Order detail), each narrated beat-by-beat via Spotlight. The order-detail scene tells
 * the complete payment -> warehouse -> weigh -> pay-supplier -> ship -> complete story on
 * one order, advancing that order's local state as each beat is reached.
 */
export function TourRunner() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [finished, setFinished] = useState(false);

  const scene = TOUR_SCENES[sceneIndex];
  const beat = scene.beats[beatIndex];
  const isLastBeatOfScene = beatIndex === scene.beats.length - 1;
  const isLastScene = sceneIndex === SCENE_ORDER.length - 1;

  // The order-detail scene's story stage tracks how far into ORDER_DETAIL_BEATS we are —
  // each of those beats carries its own `stage`, so derive it directly rather than
  // duplicating a parallel piece of state that could drift out of sync.
  const orderStage: Stage = beat.stage ?? 'awaiting-payment';

  function changeScene(nextIndex: number) {
    setFading(true);
    window.setTimeout(() => {
      setSceneIndex(nextIndex);
      setBeatIndex(0);
      setFading(false);
    }, 250);
  }

  function handleNext() {
    if (!isLastBeatOfScene) {
      setBeatIndex((i) => i + 1);
      return;
    }
    if (!isLastScene) {
      changeScene(sceneIndex + 1);
      return;
    }
    setFinished(true);
  }

  function handleBack() {
    if (beatIndex > 0) {
      setBeatIndex((i) => i - 1);
      return;
    }
    if (sceneIndex > 0) {
      changeScene(sceneIndex - 1);
    }
  }

  const totalBeats = TOUR_SCENES.reduce((sum, s) => sum + s.beats.length, 0);
  const beatsBeforeThisScene = TOUR_SCENES.slice(0, sceneIndex).reduce((sum, s) => sum + s.beats.length, 0);
  const overallProgress = ((beatsBeforeThisScene + beatIndex + 1) / totalBeats) * 100;

  if (finished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--muted))] px-6">
        <div className="w-full max-w-md rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[rgb(var(--success))]" />
          <h1 className="mb-2 font-display text-xl font-semibold text-[rgb(var(--foreground))]">
            That&apos;s the full picture
          </h1>
          <p className="mb-6 text-sm text-[rgb(var(--muted-foreground))]">
            You&apos;ve seen the dashboard, the orders list, and a full order lifecycle from placed to delivered.
            The Help Centre has written articles for anything you want to revisit.
          </p>
          <Button asChild variant="accent" className="w-full">
            <Link href="/admin/help">Back to the Help Centre</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--muted))]">
      {/* Progress bar + exit, fixed at the very top so it reads as a distinct "mode" rather
          than a page with a widget on it. */}
      <div className="fixed inset-x-0 top-0 z-[210] border-b border-[rgb(var(--border))] bg-[rgb(var(--background))]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-2.5">
          <span className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
            {scene.label}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgb(var(--muted))]">
            <div
              className="h-full rounded-full bg-[rgb(var(--accent))] transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <Link href="/admin/help" className="text-xs font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
            Exit tour
          </Link>
        </div>
      </div>

      <div className={cn('pt-12 transition-opacity duration-250', fading ? 'opacity-0' : 'opacity-100')}>
        <SceneStage sceneId={scene.id} orderStage={orderStage} />
      </div>

      {!fading && (
        <Spotlight
          // Keyed on scene only, not beat — staying mounted across beats within the same
          // scene lets it smoothly reposition (ring + callout slide/resize) instead of
          // unmounting and re-fading-in on every "Next" click, which was the visible flash.
          key={scene.id}
          target={beat.target}
          title={beat.title}
          body={beat.body}
          placement={beat.placement}
          stepLabel={`${scene.label} · ${beatIndex + 1} of ${scene.beats.length}`}
          onNext={handleNext}
          onBack={sceneIndex === 0 && beatIndex === 0 ? undefined : handleBack}
          onExit={() => setFinished(true)}
          isLastBeat={isLastBeatOfScene && isLastScene}
        />
      )}
    </div>
  );
}
