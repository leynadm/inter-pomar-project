import { client } from "./client";
import { urlFor } from "./image";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Outcome = "W" | "D" | "L";

export type CompetitionType = "league" | "friendly" | "cup" | "tournament" | string;

export type RawAppearance = {
  playerId?: string;
  name?: string;
  slug?: string;
  photo?: unknown;
  goals?: number;
  assists?: number;
  started?: boolean;
  yellowCard?: boolean;
  redCard?: boolean;
  positionsPlayed?: string[];
};

export type RawMatch = {
  _id: string;
  date: string;
  season?: string;
  competition?: CompetitionType;
  opponent: string;
  opponentCrest?: unknown;
  homeOrAway: string;
  venue?: string;
  venueMapUrl?: string;
  matchday?: number;
  score?: { home: number; away: number };
  formation?: string;
  matchVideoUrl?: string;
  highlightsVideoUrl?: string;
  appearances?: RawAppearance[];
  notes?: string;
};

export type RawPlayer = {
  _id: string;
  name: string;
  nickname?: string;
  slug?: string;
  shirtNumber?: number;
  photo?: unknown;
  position: string;
  nationality?: string;
  secondNationality?: string;
  preferredFoot?: string;
  strengths?: string[];
  status?: string;
  bio?: string;
};

export type SeasonPlayerStat = {
  _id: string;
  name: string;
  slug: string;
  appearances: number;
  goals: number;
  assists: number;
  contributions: number;
  goalsPerMatch: string;
  assistsPerMatch: string;
  photoUrl?: string;
};

export type SeasonTotals = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: Outcome[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export function crestUrl(crest: unknown): string | undefined {
  return crest ? urlFor(crest).width(80).height(80).fit("max").url() : undefined;
}

/**
 * score.home is Inter Pomar and score.away is the opponent — always.
 */
export function outcomeOf(score: { home: number; away: number }): Outcome {
  return score.home > score.away ? "W" : score.home < score.away ? "L" : "D";
}

/** Summarize goalscorers for a match (e.g. "Ferran ×2") */
export function scorersOf(match: RawMatch) {
  const tally = new Map<string, number>();
  for (const a of match.appearances ?? []) {
    if (!a.goals || !a.name) continue;
    tally.set(a.name, (tally.get(a.name) ?? 0) + a.goals);
  }
  return [...tally.entries()]
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals);
}

/** Generic record counter for any set of matches (League, Friendly, Cup) */
export function calculateRecordFor(matches: RawMatch[]): Omit<SeasonTotals, "form"> {
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of matches) {
    if (!m.score) continue;
    goalsFor += m.score.home;
    goalsAgainst += m.score.away;
    if (m.score.home > m.score.away) won++;
    else if (m.score.home < m.score.away) lost++;
    else drawn++;
  }

  return {
    played: matches.length,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
  };
}

// ─── Homepage Query ─────────────────────────────────────────────────────────


function buildSeasonScope(matches: RawMatch[]) {
  const totals = {
    ...calculateRecordFor(matches),
    form: matches
      .slice(0, 5)
      .filter((m) => m.score)
      .map((m) => outcomeOf(m.score!))
      .reverse(),
  };

  const scorerMap = new Map<
    string,
    {
      _id: string;
      name: string;
      slug: string;
      photo?: unknown;
      appearances: number;
      goals: number;
      assists: number;
    }
  >();

  for (const m of matches) {
    for (const a of m.appearances ?? []) {
      if (!a.playerId || !a.name) continue;
      const entry = scorerMap.get(a.playerId) ?? {
        _id: a.playerId,
        name: a.name,
        slug: a.slug ?? "",
        photo: a.photo,
        appearances: 0,
        goals: 0,
        assists: 0,
      };
      entry.appearances += 1;
      entry.goals += a.goals ?? 0;
      entry.assists += a.assists ?? 0;
      scorerMap.set(a.playerId, entry);
    }
  }

  const allPlayersStats = [...scorerMap.values()].map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    appearances: p.appearances,
    goals: p.goals,
    assists: p.assists,
    contributions: p.goals + p.assists,
    goalsPerMatch:
      p.appearances > 0 ? (p.goals / p.appearances).toFixed(2) : "0.00",
    assistsPerMatch:
      p.appearances > 0 ? (p.assists / p.appearances).toFixed(2) : "0.00",
    photoUrl: p.photo
      ? urlFor(p.photo).width(80).height(80).fit("crop").url()
      : undefined,
  }));

  return {
    totals,
    scorers: [...allPlayersStats]
      .filter((p) => p.goals > 0)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, 5),
    assisters: [...allPlayersStats]
      .filter((p) => p.assists > 0)
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
      .slice(0, 5),
    contributions: [...allPlayersStats]
      .filter((p) => p.contributions > 0)
      .sort((a, b) => b.contributions - a.contributions || b.goals - a.goals)
      .slice(0, 5),
    leaderboard: [...allPlayersStats]
      .filter((p) => p.appearances > 0)
      .sort((a, b) => b.contributions - a.contributions || b.goals - a.goals),
  };
}

// 2. In getHomepageData(), compute seasonData and return it:

export async function getHomepageData() {
  const data = await client.fetch<{
    nextMatch: RawMatch | null;
    upcomingFixtures: RawMatch[];
    playedMatches: RawMatch[];
    squadPreview: RawPlayer[];
  }>(`{
    "nextMatch": *[_type == "match" && date > now()] | order(date asc)[0] {
      _id, date, season, competition, opponent, opponentCrest, homeOrAway,
      venue, venueMapUrl, matchday
    },

    "upcomingFixtures": *[_type == "match" && date > now()] | order(date asc)[0...5] {
      _id, date, season, competition, opponent, opponentCrest, homeOrAway, venue, matchday
    },

    "playedMatches": *[_type == "match" && defined(score.home)] | order(date desc) {
      _id, date, season, competition, opponent, opponentCrest, homeOrAway, matchday, score,
      matchVideoUrl, highlightsVideoUrl,
      appearances[] {
        goals,
        assists,
        started,
        yellowCard,
        redCard,
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

  // Group matches by competition:
  const leagueMatches = played.filter(
    (m) => m.competition === "league" || !m.competition
  );
  const friendlyMatches = played.filter(
    (m) => m.competition === "friendly" || m.competition === "Partido Amistoso"
  );
  const cupMatches = played.filter((m) => m.competition === "cup");

  // Build the multi-competition season scopes:
  const seasonData = {
    all: buildSeasonScope(played),
    league: buildSeasonScope(leagueMatches),
    friendly: buildSeasonScope(friendlyMatches),
    cup: buildSeasonScope(cupMatches),
  };

  const videoMatch = played.find(
    (m) => m.highlightsVideoUrl || m.matchVideoUrl
  );

  return {
    nextMatch: data.nextMatch
      ? {
        _id: data.nextMatch._id,
        date: data.nextMatch.date,
        season: data.nextMatch.season,
        competition: data.nextMatch.competition,
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
      season: m.season,
      competition: m.competition,
      opponent: m.opponent,
      homeOrAway: m.homeOrAway,
      venue: m.venue,
      matchday: m.matchday,
      opponentCrestUrl: crestUrl(m.opponentCrest),
    })),

    recentResults: played.slice(0, 5).map((m) => ({
      _id: m._id,
      date: m.date,
      season: m.season,
      competition: m.competition,
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
        season: videoMatch.season,
        competition: videoMatch.competition,
        opponent: videoMatch.opponent,
        homeOrAway: videoMatch.homeOrAway,
        score: videoMatch.score,
        videoUrl: videoMatch.highlightsVideoUrl || videoMatch.matchVideoUrl,
      }
      : undefined,

    seasonData, // 👈 Returned here so page.tsx can access data.seasonData

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



// ─── Squad With Stats ───────────────────────────────────────────────────────

export async function getSquadWithStats() {
  const data = await client.fetch<{
    players: RawPlayer[];
    playedMatches: RawMatch[];
  }>(`{
    "players": *[_type == "player"] | order(shirtNumber asc) {
      _id, name, nickname, "slug": slug.current, shirtNumber, photo,
      nationality, secondNationality, preferredFoot, strengths, status, "position": primaryPosition
    },
    "playedMatches": *[_type == "match" && defined(score.home)] {
      competition,
      appearances[] {
        goals,
        assists,
        started,
        yellowCard,
        redCard,
        "playerId": player->_id
      }
    }
  }`);

  const totals = new Map<
    string,
    {
      appearances: number;
      goals: number;
      assists: number;
      leagueAppearances: number;
      leagueGoals: number;
      friendlyAppearances: number;
      friendlyGoals: number;
    }
  >();

  for (const m of data.playedMatches ?? []) {
    const isFriendly = m.competition === "friendly" || m.competition === "Partido Amistoso";

    for (const a of m.appearances ?? []) {
      if (!a.playerId) continue;
      const entry = totals.get(a.playerId) ?? {
        appearances: 0,
        goals: 0,
        assists: 0,
        leagueAppearances: 0,
        leagueGoals: 0,
        friendlyAppearances: 0,
        friendlyGoals: 0,
      };

      entry.appearances += 1;
      entry.goals += a.goals ?? 0;
      entry.assists += a.assists ?? 0;

      if (isFriendly) {
        entry.friendlyAppearances += 1;
        entry.friendlyGoals += a.goals ?? 0;
      } else {
        entry.leagueAppearances += 1;
        entry.leagueGoals += a.goals ?? 0;
      }

      totals.set(a.playerId, entry);
    }
  }

  return (data.players ?? []).map((p) => ({
    _id: p._id,
    name: p.name,
    nickname: p.nickname,
    slug: p.slug ?? "",
    shirtNumber: p.shirtNumber,
    nationality: p.nationality,
    secondNationality: p.secondNationality,
    position: p.position,
    photoUrl: p.photo
      ? urlFor(p.photo).width(600).height(750).fit("crop").url()
      : undefined,
    stats: totals.get(p._id) ?? {
      appearances: 0,
      goals: 0,
      assists: 0,
      leagueAppearances: 0,
      leagueGoals: 0,
      friendlyAppearances: 0,
      friendlyGoals: 0,
    },
  }));
}

// ─── Additional Queries ─────────────────────────────────────────────────────

export async function getSquad() {
  return client.fetch<RawPlayer[]>(`
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
      status,
      bio
    }
  `);
}

export async function getAllMatches() {
  return client.fetch<RawMatch[]>(`
    *[_type == "match"] | order(date desc) {
      _id,
      date,
      season,
      competition,
      opponent,
      opponentCrest,
      homeOrAway,
      venue,
      venueMapUrl,
      matchday,
      score,
      formation,
      matchVideoUrl,
      highlightsVideoUrl,
      appearances[] {
        player-> { _id, name, shirtNumber, photo },
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
  return client.fetch<RawMatch>(
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
