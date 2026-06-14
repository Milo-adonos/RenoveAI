"use client";

import { useMemo } from "react";

const NOTIFICATION_NAMES = [
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
  "Yasmine",
  "Quentin",
  "Laura",
  "Mehdi",
  "Pauline",
  "Alexis",
  "Fatou",
  "Clément",
  "Julie",
  "Samy",
  "Marion",
  "Mathis",
  "Anaïs",
  "Tristan",
  "Elisa",
  "Romain",
  "Ambre",
  "Dylan",
  "Margot",
  "Kevin",
  "Céline",
  "Kylian",
  "Nina",
  "Pierre",
  "Salma",
  "Florian",
  "Emilie",
  "Sacha",
  "Noémie",
  "Victor",
  "Assia",
  "Guillaume",
  "Pauline",
  "Ilyes",
  "Cindy",
  "Mathieu",
  "Alicia",
  "Adrien",
  "Naomi",
  "Thibault",
  "Justine",
  "Damien",
  "Louna",
  "Simon",
  "Khady",
  "Nicolas",
  "Oriane",
  "Timothée",
  "Sirine",
  "Malo",
  "Cassandra",
  "Eliott",
  "Dina",
  "Rémi",
  "Lola",
  "Ayoub",
  "Elisa",
  "Corentin",
  "Maëva",
];

const AVATAR_COLORS = [
  "#E8D5C4",
  "#C4D5E8",
  "#C4E8D5",
  "#E8C4D5",
  "#D5C4E8",
  "#E8E4C4",
];

const TIME_OPTIONS = [
  "à l'instant",
  "il y a 1 min",
  "il y a 2 min",
  "il y a 3 min",
  "il y a 5 min",
  "il y a 7 min",
  "il y a 10 min",
  "il y a 12 min",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % 100000;
  }
  return hash;
}

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function NotificationCard({
  name,
  timeLabel,
}: {
  name: string;
  timeLabel: string;
}) {
  return (
    <div
      className="flex w-[260px] shrink-0 items-center rounded-[12px] bg-white px-3 py-2"
      style={{ boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)" }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: getAvatarColor(name) }}
      >
        <span
          className="font-bold leading-none text-white"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "14px",
          }}
        >
          {getInitial(name)}
        </span>
      </div>
      <div className="ml-2 min-w-0">
        <p
          className="font-bold leading-tight"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "13px",
            color: "#1A1A1A",
          }}
        >
          {name}
        </p>
        <p
          className="leading-tight mt-0.5"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "12px",
            color: "#8B7D6B",
          }}
        >
          vient de débloquer son rendu ✦
        </p>
        <p
          className="leading-tight mt-0.5"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "11px",
            color: "#C4B8AC",
          }}
        >
          {timeLabel}
        </p>
      </div>
    </div>
  );
}

export function PreviewSocialProof() {
  const timeLabels = useMemo(
    () =>
      NOTIFICATION_NAMES.map(
        () => TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)]
      ),
    []
  );

  const notifications = NOTIFICATION_NAMES.map((name, index) => (
    <NotificationCard
      key={`notification-${index}`}
      name={name}
      timeLabel={timeLabels[index]}
    />
  ));

  return (
    <div
      className="mt-5 mx-auto preview-notifications-mask overflow-hidden h-[280px] w-full flex justify-center"
      aria-hidden="true"
    >
      <div className="animate-preview-scroll-vertical flex w-[260px] flex-col gap-2">
        {notifications}
        {NOTIFICATION_NAMES.map((name, index) => (
          <NotificationCard
            key={`notification-dup-${index}`}
            name={name}
            timeLabel={timeLabels[index]}
          />
        ))}
      </div>
    </div>
  );
}
