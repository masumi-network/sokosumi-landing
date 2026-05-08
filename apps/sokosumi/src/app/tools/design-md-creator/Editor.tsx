"use client";

import type { DesignSystem, Frontmatter } from "./lib/design-md";

type Props = {
  system: DesignSystem;
  onChange: (next: DesignSystem) => void;
};

export default function Editor({ system, onChange }: Props) {
  const fm = system.frontmatter;

  const update = (next: Frontmatter) => {
    onChange({ ...system, frontmatter: next });
  };

  return (
    <div className="flex flex-col gap-8 p-6 bg-[#fafafa] border border-black/[0.06] rounded-[8px] lg:sticky lg:top-6">
      <div>
        <Label>Name</Label>
        <Input
          value={fm.name ?? ""}
          onChange={(v) => update({ ...fm, name: v })}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={fm.description ?? ""}
          onChange={(v) => update({ ...fm, description: v })}
        />
      </div>

      {fm.colors && (
        <div>
          <Label>Colors</Label>
          <div className="flex flex-col gap-2">
            {Object.entries(fm.colors).map(([name, hex]) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-black/[0.08]"
                  style={{ background: hex }}
                />
                <span className="text-[12px] text-[#999] w-[80px]">{name}</span>
                <input
                  type="color"
                  value={hex.length === 7 ? hex : "#000000"}
                  onChange={(e) =>
                    update({
                      ...fm,
                      colors: { ...fm.colors, [name]: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-black/[0.08] cursor-pointer"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) =>
                    update({
                      ...fm,
                      colors: { ...fm.colors, [name]: e.target.value },
                    })
                  }
                  className="flex-1 text-[12px] font-mono px-2 py-1 border border-black/[0.08] rounded bg-white focus:outline-none focus:border-black/30"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {fm.typography && (
        <div>
          <Label>Typography (font family)</Label>
          <div className="flex flex-col gap-2">
            {Object.entries(fm.typography).map(([name, t]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-[12px] text-[#999] w-[80px]">{name}</span>
                <input
                  type="text"
                  value={t.fontFamily ?? ""}
                  onChange={(e) =>
                    update({
                      ...fm,
                      typography: {
                        ...fm.typography,
                        [name]: { ...t, fontFamily: e.target.value },
                      },
                    })
                  }
                  placeholder="Inter"
                  className="flex-1 text-[13px] px-2 py-1 border border-black/[0.08] rounded bg-white focus:outline-none focus:border-black/30"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] text-[#999] uppercase tracking-[0.1em] mb-2">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-[14px] px-3 py-2 border border-black/[0.08] rounded bg-white focus:outline-none focus:border-black/30"
    />
  );
}

function Textarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full text-[14px] px-3 py-2 border border-black/[0.08] rounded bg-white focus:outline-none focus:border-black/30 resize-none"
    />
  );
}
