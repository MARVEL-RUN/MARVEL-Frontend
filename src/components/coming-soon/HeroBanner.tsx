import Image from "next/image";
import { IMAGES } from "@/lib/assets";

const CHARACTERS = [
  {
    slug: "cyclops",
    name: "Cyclops",
    src: IMAGES.characters.cyclops,
    band: "#1e6bd6",
    fit: "object-[center_18%] scale-[1.25]",
  },
  {
    slug: "the-thing",
    name: "The Thing",
    src: IMAGES.characters.theThing,
    band: "#1aa3a8",
    fit: "object-[center_12%] scale-[1.3]",
  },
  {
    slug: "doctor-doom",
    name: "Doctor Doom",
    src: IMAGES.characters.doctorDoom,
    band: "#2f8f4e",
    fit: "object-[center_22%] scale-[1.45]",
  },
  {
    slug: "thor",
    name: "Thor",
    src: IMAGES.characters.thor,
    band: "#d12b32",
    fit: "object-[center_18%] scale-[1.55]",
  },
  {
    slug: "captain-america",
    name: "Captain America",
    src: IMAGES.characters.captainAmerica,
    band: "#6a3bb5",
    fit: "object-[center_12%] scale-[1.05]",
  },
] as const;

export function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-banner__track">
        {CHARACTERS.map((character) => (
          <div
            key={character.slug}
            className="hero-banner__slot"
            style={{ background: character.band }}
          >
            <Image
              src={character.src}
              alt={character.name}
              fill
              priority
              sizes="120px"
              className={`object-cover object-top drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] ${character.fit}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
