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

function NotificationCard({ name }: { name: string }) {
  return (
    <div
      className="flex w-[260px] shrink-0 items-center rounded-[12px] bg-white px-[14px] py-[10px]"
      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
    >
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full bg-[#F5F0EA]"
        draggable={false}
      />
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
      </div>
    </div>
  );
}

export function PreviewSocialProof() {
  const notifications = NOTIFICATION_NAMES.map((name, index) => (
    <NotificationCard key={`notification-${index}`} name={name} />
  ));

  return (
    <div
      className="mt-5 mx-auto preview-notifications-mask overflow-hidden h-[280px] w-full flex justify-center"
      aria-hidden="true"
    >
      <div className="animate-preview-scroll-vertical flex w-[260px] flex-col gap-2">
        {notifications}
        {NOTIFICATION_NAMES.map((name, index) => (
          <NotificationCard key={`notification-dup-${index}`} name={name} />
        ))}
      </div>
    </div>
  );
}
