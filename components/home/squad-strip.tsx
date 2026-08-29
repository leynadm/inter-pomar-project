"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/app/i18n/navigation";
import { User } from "lucide-react";

export type Player = {
  _id: string;
  name: string;
  nickname?: string;
  slug: string;
  shirtNumber?: number;
  photoUrl?: string;
  position: string;
};

export function SquadStrip({ players }: { players: Player[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Smooth infinite auto-scroll loop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || players.length === 0) return;

    let animationFrameId: number;

    const step = () => {
      if (!isPaused && el) {
        // When scrolled past the first duplicate set, loop back seamlessly
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += 0.75; // Adjust speed (0.5 = slow, 1.0 = faster)
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, players.length]);

  if (players.length === 0) return null;

  // Duplicate array for continuous infinite scrolling
  const displayPlayers = [...players, ...players];

  return (
    <div
      className="relative -mx-5 px-5 sm:-mx-8 sm:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Auto-scrolling Strip Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {displayPlayers.map((p, idx) => {
          const displayName = p.nickname || p.name;

          return (
            <div
              key={`${p._id}-${idx}`}
              className="w-38 shrink-0 sm:w-44 lg:w-48"
            >
              <Link
                href={{
                  pathname: "/plantilla/[slug]",
                  params: { slug: p.slug },
                }}
                className="group block focus-visible:outline-none"
              >
                <article className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-normal ease-out group-hover:-translate-y-1 group-hover:border-pitch/30 group-hover:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-pitch">

                  {/* 1. Top Green Turf Banner */}
                  <div className="relative h-16 bg-linear-to-r from-pitch to-pitch-deep px-3 pt-2.5">
                    <div className="mow absolute inset-0 opacity-30" aria-hidden />

                    <div className="relative z-10 flex items-center justify-between">
                      {p.shirtNumber != null ? (
                        <span className="score-display rounded-md bg-neutral-950/40 px-2 py-0.5 text-xs font-bold text-sand-300 backdrop-blur-xs">
                          #{p.shirtNumber}
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>
                  </div>

                  {/* 2. Framed Avatar Medallion (Crisp 64px–72px frame) */}
                  <div className="relative z-10 -mt-8 flex justify-center px-3">
                    <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border-3 border-white bg-neutral-100 shadow-md ring-1 ring-neutral-200/60 transition-transform duration-normal ease-out group-hover:scale-105 sm:size-18">
                      {p.photoUrl ? (
                        <Image
                          src={p.photoUrl}
                          alt={displayName}
                          width={72}
                          height={72}
                          className="size-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-green-50 text-pitch">
                          {p.shirtNumber != null ? (
                            <span className="score-display text-xl font-bold">
                              {p.shirtNumber}
                            </span>
                          ) : (
                            <User className="size-6 text-neutral-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Name & Position */}
                  <div className="px-3 pt-2 pb-3.5 text-center">
                    <h3 className="display truncate text-sm font-bold text-neutral-900 transition-colors duration-fast group-hover:text-pitch sm:text-base">
                      {displayName}
                    </h3>
                    <div className="mt-1 flex justify-center">
                      <span className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pitch sm:text-[11px]">
                        {p.position}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
