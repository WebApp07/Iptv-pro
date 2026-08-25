import type { Metadata } from "next";
import { getTitleBySlug } from "@/lib/movies";
import { TitleDetailView } from "@/components/movies/title-detail";

type MoviePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getTitleBySlug(slug);
  const title = result.data;
  if (!title) return { title: "Movie not found" };

  const description = title.plot
    ? `${title.plot.slice(0, 155)}${title.plot.length > 155 ? "..." : ""}`
    : `Learn about ${title.title}${title.year ? ` (${title.year})` : ""} - IMDb rating, cast, genres and more.`;

  return {
    title: `${title.title}${title.year ? ` (${title.year})` : ""} | IPTV Pro`,
    description,
    alternates: { canonical: `/movies/${slug}` },
    openGraph: {
      title: `${title.title}${title.year ? ` (${title.year})` : ""}`,
      description,
      url: `/movies/${slug}`,
      ...(title.posterUrl ? { images: [{ url: title.posterUrl }] } : {}),
    },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { slug } = await params;
  return <TitleDetailView slug={slug} basePath="/movies" />;
}
