import { client } from "@/sanity/lib/client";
import { FormationBuilder } from "./formation-builder";

async function getActivePlayers() {
  return client.fetch(`
    *[_type == "player" && status == "active"] | order(shirtNumber asc) {
      _id,
      name,
      nickname,
      shirtNumber,
      photo,
      primaryPosition,
      secondaryPositions,
      strengths,
      nationality
    }
  `);
}

export default async function VestidorPage() {
  const players = await getActivePlayers();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-[#1B6B33] px-4 py-3 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">El Vestidor</h1>
            <p className="text-xs text-white/60">
              Inter Pomar · Generador d&apos;alineacions
            </p>
          </div>
          <p className="text-sm text-white/60">
            {players.length} jugadors disponibles
          </p>
        </div>
      </header>

      {/* Formation Builder (client component) */}
      <FormationBuilder players={players} />
    </div>
  );
}
