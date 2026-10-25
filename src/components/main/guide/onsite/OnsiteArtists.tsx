import Image from "next/image";
import { ONSITE_ARTIST_DISCLAIMER, ONSITE_ARTISTS } from "@/lib/onsite-program";

export function OnsiteArtists() {
  return (
    <>
      <ul className="onsite-artists">
        {ONSITE_ARTISTS.map((artist) => (
          <li key={artist.id} className="onsite-artists__item">
            <Image
              src={artist.photo}
              alt={`${artist.role} ${artist.name}`}
              width={404}
              height={404}
              sizes="(max-width: 720px) 46vw, 404px"
              className="onsite-artists__img"
            />
          </li>
        ))}
      </ul>
      <p className="onsite-artists__disclaimer">{ONSITE_ARTIST_DISCLAIMER}</p>
    </>
  );
}
