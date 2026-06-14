const SOCIAL_PROOF_LINES = [
  {
    names: [
      "Emma",
      "Lucas",
      "Inès",
      "Noah",
      "Camille",
      "Théo",
      "Léa",
      "Yanis",
      "Chloé",
      "Axel",
    ],
    direction: "left" as const,
    duration: 18,
  },
  {
    names: [
      "Sarah",
      "Rayan",
      "Jade",
      "Tom",
      "Manon",
      "Enzo",
      "Lucie",
      "Adam",
      "Zoé",
      "Noa",
    ],
    direction: "right" as const,
    duration: 22,
  },
  {
    names: [
      "Lina",
      "Hugo",
      "Eva",
      "Antoine",
      "Mia",
      "Baptiste",
      "Clara",
      "Karim",
      "Amélie",
      "Julien",
    ],
    direction: "left" as const,
    duration: 16,
  },
  {
    names: [
      "Nora",
      "Maxime",
      "Sofia",
      "Ethan",
      "Alice",
      "Raphaël",
      "Lena",
      "Nathan",
      "Océane",
      "Louis",
    ],
    direction: "right" as const,
    duration: 24,
  },
];

function SocialProofBadge({ name }: { name: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-[20px] bg-white px-[14px] py-2 shadow-soft whitespace-nowrap"
      style={{
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: "12px",
        color: "#1A1A1A",
      }}
    >
      <span className="text-[#A0522D]">✦</span>
      {name} vient de débloquer son rendu
    </span>
  );
}

function SocialProofLine({
  names,
  direction,
  duration,
}: {
  names: string[];
  direction: "left" | "right";
  duration: number;
}) {
  const badges = names.flatMap((name, index) => [
    <SocialProofBadge key={`${name}-a-${index}`} name={name} />,
    <SocialProofBadge key={`${name}-b-${index}`} name={name} />,
  ]);

  return (
    <div className="preview-marquee-mask overflow-hidden">
      <div
        className={`flex w-max gap-2 ${
          direction === "left"
            ? "animate-preview-scroll-left"
            : "animate-preview-scroll-right"
        }`}
        style={{ animationDuration: `${duration}s` }}
      >
        {badges}
      </div>
    </div>
  );
}

export function PreviewSocialProof() {
  return (
    <div className="mt-5 space-y-2" aria-hidden="true">
      {SOCIAL_PROOF_LINES.map((line) => (
        <SocialProofLine
          key={line.duration + line.direction}
          names={line.names}
          direction={line.direction}
          duration={line.duration}
        />
      ))}
    </div>
  );
}
