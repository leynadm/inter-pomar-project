import { client } from "./client";
import { urlFor } from "./image";

// ─── Types ──────────────────────────────────────────────────────────────────

type Outcome = "W" | "D" | "L";

type RawAppearance = {
  playerId?: string;
  name?: string;
  slug?: string;
  photo?: unknown;
  goals?: number;
  assists?: number;
};

type RawMatch = {
  _id: string;
  date: string;
  opponent: string;
  opponentCrest?: unknown;
  homeOrAway: string;
  venue?: string;
  venueMapUrl?: string;
  matchday?: number;
  competition?: string;
  score?: { home: number; away: number };
  matchVideoUrl?: string;
  highlightsVideoUrl?: string;
  appearances?: RawAppearance[];
};

type RawPlayer = {
  _id: string;
  name: string;
  nickname?: string;
  slug?: string;
  shirtNumber?: number;
  photo?: unknown;
  position: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function crestUrl(crest: unknown) {
  return crest ? urlFor(crest).width(80).height(80).fit("max").url() : undefined;
}

/**
 * score.home is Inter Pomar and score.away is the opponent — always, at either
 * venue. That's how the Sanity schema labels the two fields. Venue only affects
 * which side of the dash each number is printed on.
 */
function outcomeOf(score: { home: number; away: number }): Outcome {
  return score.home > score.away ? "W" : score.home < score.away ? "L" : "D";
}

/** One line per player, so a brace reads "Ferran ×2" rather than twice. */
function scorersOf(match: RawMatch) {
  const tally = new Map<string, number>();
  for (const a of match.appearances ?? []) {
    if (!a.goals || !a.name) continue;
    tally.set(a.name, (tally.get(a.name) ?? 0) + a.goals);
  }
  return [...tally.entries()]
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals);
}

// ─── Homepage ───────────────────────────────────────────────────────────────

export async function getHomepageData() {
  const data = await client.fetch<{
    nextMatch: RawMatch | null;
    upcomingFixtures: RawMatch[];
    playedMatches: RawMatch[];
    squadPreview: RawPlayer[];
  }>(`{
    "nextMatch": *[_type == "match" && date > now()] | order(date asc)[0] {
      _id, date, opponent, opponentCrest, homeOrAway,
      competition, venue, venueMapUrl, matchday
    },

    "upcomingFixtures": *[_type == "match" && date > now()] | order(date asc)[0...5] {
      _id, date, opponent, opponentCrest, homeOrAway, venue, matchday
    },

    "playedMatches": *[_type == "match" && defined(score.home)] | order(date desc) {
      _id, date, opponent, opponentCrest, homeOrAway, matchday, score,
      matchVideoUrl, highlightsVideoUrl,
      appearances[] {
        goals,
        assists,
        "playerId": player->_id,
        "name": coalesce(player->nickname, player->name),
        "slug": player->slug.current,
        "photo": player->photo
      }
    },
    "squadPreview": *[_type == "player" && (!defined(status) || status == "active")]
      | order(shirtNumber asc) {
        _id, name, nickname, "slug": slug.current, shirtNumber, photo,
        "position": primaryPosition
      }
  }`);

  const played = data.playedMatches ?? [];

  // ── Season totals, derived rather than stored ────────────────────────────
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of played) {
    if (!m.score) continue;
    goalsFor += m.score.home;
    goalsAgainst += m.score.away;
    if (m.score.home > m.score.away) won++;
    else if (m.score.home < m.score.away) lost++;
    else drawn++;
  }

  // playedMatches is newest-first; form reads oldest-to-newest, left to right.
  const form = played
    .slice(0, 5)
    .filter((m) => m.score)
    .map((m) => outcomeOf(m.score!))
    .reverse();

  const seasonTotals = {
    played: played.length,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    form,
  };

  // ── Top scorers, aggregated across every appearance ──────────────────────
  const scorerMap = new Map<
    string,
    { _id: string; name: string; slug: string; photo?: unknown; goals: number; assists: number }
  >();

  for (const m of played) {
    for (const a of m.appearances ?? []) {
      if (!a.playerId || !a.name) continue;
      const entry = scorerMap.get(a.playerId) ?? {
        _id: a.playerId,
        name: a.name,
        slug: a.slug ?? "",
        photo: a.photo,
        goals: 0,
        assists: 0,
      };
      entry.goals += a.goals ?? 0;
      entry.assists += a.assists ?? 0;
      scorerMap.set(a.playerId, entry);
    }
  }

  const topScorers = [...scorerMap.values()]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 5)
    .map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      goals: p.goals,
      assists: p.assists,
      photoUrl: p.photo
        ? urlFor(p.photo).width(72).height(72).fit("crop").url()
        : undefined,
    }));

  // ── Latest match with a video ────────────────────────────────────────────
  const videoMatch = played.find(
    (m) => m.highlightsVideoUrl || m.matchVideoUrl
  );

  return {
    nextMatch: data.nextMatch
      ? {
        date: data.nextMatch.date,
        opponent: data.nextMatch.opponent,
        opponentCrestUrl: crestUrl(data.nextMatch.opponentCrest),
        homeOrAway: data.nextMatch.homeOrAway,
        venue: data.nextMatch.venue,
        venueMapUrl: data.nextMatch.venueMapUrl,
        matchday: data.nextMatch.matchday,
      }
      : null,

    upcomingFixtures: (data.upcomingFixtures ?? []).map((m) => ({
      _id: m._id,
      date: m.date,
      opponent: m.opponent,
      homeOrAway: m.homeOrAway,
      venue: m.venue,
      matchday: m.matchday,
      opponentCrestUrl: crestUrl(m.opponentCrest),
    })),

    recentResults: played.slice(0, 5).map((m) => ({
      _id: m._id,
      date: m.date,
      opponent: m.opponent,
      homeOrAway: m.homeOrAway,
      matchday: m.matchday,
      score: m.score,
      outcome: m.score ? outcomeOf(m.score) : undefined,
      opponentCrestUrl: crestUrl(m.opponentCrest),
      scorers: scorersOf(m),
    })),

    latestMatchWithVideo: videoMatch
      ? {
        _id: videoMatch._id,
        date: videoMatch.date,
        opponent: videoMatch.opponent,
        homeOrAway: videoMatch.homeOrAway,
        score: videoMatch.score,
        videoUrl: videoMatch.highlightsVideoUrl || videoMatch.matchVideoUrl,
      }
      : undefined,

    topScorers,
    seasonTotals,

    squadPreview: (data.squadPreview ?? []).map((p) => ({
      _id: p._id,
      name: p.name,
      nickname: p.nickname,
      slug: p.slug ?? "",
      shirtNumber: p.shirtNumber,
      position: p.position,
      photoUrl: p.photo
        ? urlFor(p.photo).width(360).height(480).fit("crop").url()
        : undefined,
    })),
  };
}

// ─── Squad, with season totals per player ───────────────────────────────────

export async function getSquadWithStats() {
  const data = await client.fetch<{
    players: (RawPlayer & { nationality?: string })[];
    playedMatches: RawMatch[];
  }>(`{
    "players": *[_type == "player"] | order(shirtNumber asc) {
      _id, name, nickname, "slug": slug.current, shirtNumber, photo,
      nationality, status, "position": primaryPosition
    },
    "playedMatches": *[_type == "match" && defined(score.home)] {
      appearances[] {
        goals,
        assists,
        "playerId": player->_id
      }
    }
  }`);

  const totals = new Map<
    string,
    { appearances: number; goals: number; assists: number }
  >();

  for (const m of data.playedMatches ?? []) {
    for (const a of m.appearances ?? []) {
      if (!a.playerId) continue;
      const entry = totals.get(a.playerId) ?? {
        appearances: 0,
        goals: 0,
        assists: 0,
      };
      entry.appearances += 1;
      entry.goals += a.goals ?? 0;
      entry.assists += a.assists ?? 0;
      totals.set(a.playerId, entry);
    }
  }

  return (data.players ?? []).map((p) => ({
    _id: p._id,
    name: p.name,
    nickname: p.nickname,
    slug: p.slug ?? "",
    shirtNumber: p.shirtNumber,
    nationality: (p as { nationality?: string }).nationality,
    position: p.position,
    photoUrl: p.photo
      ? urlFor(p.photo).width(600).height(750).fit("crop").url()
      : undefined,
    stats: totals.get(p._id) ?? { appearances: 0, goals: 0, assists: 0 },
  }));
}

// ─── Unchanged ──────────────────────────────────────────────────────────────

export async function getSquad() {
  return client.fetch(`
    *[_type == "player"] | order(shirtNumber asc) {
      _id,
      name,
      nickname,
      slug,
      shirtNumber,
      photo,
      primaryPosition,
      secondaryPositions,
      nationality,
      secondNationality,
      preferredFoot,
      strengths,
      status
    }
  `);
}

export async function getAllMatches() {
  return client.fetch(`
    *[_type == "match"] | order(date desc) {
      _id,
      date,
      opponent,
      opponentCrest,
      homeOrAway,
      competition,
      venue,
      matchday,
      score,
      formation,
      matchVideoUrl,
      highlightsVideoUrl,
      appearances[] {
        player-> { _id, name, shirtNumber },
        positionsPlayed,
        started,
        goals,
        assists,
        yellowCard,
        redCard
      }
    }
  `);
}

export async function getMatch(id: string) {
  return client.fetch(
    `*[_type == "match" && _id == $id][0] {
      ...,
      appearances[] {
        player-> { _id, name, shirtNumber, photo, primaryPosition },
        positionsPlayed,
        started,
        goals,
        assists,
        yellowCard,
        redCard
      }
    }`,
    { id }
  );
}
