import type { Image, Video, ExternalLink } from "../../types/technology";

interface Props {
  techId: string;
  images: Image[];
  videos: Video[];
  links: ExternalLink[];
}

export function MediaGallery({ techId, images, videos, links }: Props) {
  return (
    <div className="space-y-10">
      <section>
        <h3 className="font-display text-xl font-semibold text-codex-text">
          Images
        </h3>
        {images.length === 0 ? (
          <p className="mt-2 text-sm text-codex-muted">
            No images yet for this entry. Add files under{" "}
            <code className="font-mono text-codex-secondary">
              /public/images/{techId}/
            </code>{" "}
            and reference them in the JSON.
          </p>
        ) : (
          <ul className="mt-4 grid gap-6 sm:grid-cols-2">
            {images.map((img) => (
              <li key={img.id} className="rounded-lg border border-codex-border bg-codex-card p-3">
                <img
                  src={`/images/${techId}/${img.filename}`}
                  alt={img.caption}
                  className="max-h-64 w-full rounded object-contain bg-codex-bg"
                  loading="lazy"
                />
                <p className="mt-2 text-sm text-codex-text">{img.caption}</p>
                <p className="mt-1 font-mono text-[10px] text-codex-muted">
                  {img.type} · {img.credit} · {img.license}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold text-codex-text">
          Video
        </h3>
        {videos.length === 0 ? (
          <p className="mt-2 text-sm text-codex-muted">
            No linked videos for this entry.
          </p>
        ) : (
          <ul className="mt-4 space-y-6">
            {videos.map((v) => (
              <li key={v.id} className="rounded-lg border border-codex-border bg-codex-card p-4">
                <h4 className="font-medium text-codex-text">{v.title}</h4>
                <p className="mt-1 text-sm text-codex-secondary">{v.description}</p>
                <p className="mt-1 font-mono text-xs text-codex-muted">
                  Duration: {Math.round(v.durationSeconds / 60)} min (approx.)
                </p>
                {v.youtubeId ? (
                  <div className="mt-3 aspect-video w-full overflow-hidden rounded border border-codex-border">
                    <iframe
                      title={v.title}
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold text-codex-text">
          References
        </h3>
        <ul className="mt-2 space-y-2">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                className="text-sm text-codex-blue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
                target="_blank"
                rel="noreferrer"
              >
                {l.title}
              </a>
              {l.note ? (
                <p className="text-xs text-codex-muted">{l.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
