export type CastChild = {
  id: string;
  label?: string;
  props?: any;
};

export type CastState = {
  eventId: string;

  children: CastChild[];

  homeOrder: number[];
  activeChildIndex: number | null;
  layoutKey: string;
};