import { LAYOUTS } from "@/lib/layouts";

type LayoutKey = keyof typeof LAYOUTS;

export default function GridRenderer({
  state,
}: {
  state?: { layoutKey?: LayoutKey; children?: any[]; homeOrder?: number[] };
}) {
  if (!state) return null;

  const layout = LAYOUTS[state.layoutKey ?? "single"] || LAYOUTS.single;

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {(state.children || []).map((child: any, i: number) => {
        const index = (state.homeOrder || []).indexOf(i);
        const slot = layout.slots[index];

        if (!slot) return null;

        return (
          <div
            key={child?.id || i}
            style={{
              position: "absolute",
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.w}%`,
              height: `${slot.h}%`,
            }}
          >
            <div className="w-full h-full bg-neutral-800 text-white flex items-center justify-center">
              {child?.label || `Stream ${i + 1}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}