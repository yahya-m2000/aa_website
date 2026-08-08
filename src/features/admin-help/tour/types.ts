import type { Placement } from './spotlight';
import type { Stage } from './scenes/order-detail-scene';

export type SceneId = 'dashboard' | 'orders-list' | 'order-detail';

export interface Beat {
  target: string;
  title: string;
  body: string;
  placement?: Placement;
  /** Only meaningful for order-detail scene beats — advances OrderDetailScene's story state when this beat is entered. */
  stage?: Stage;
}

export interface Scene {
  id: SceneId;
  label: string;
  beats: Beat[];
}
