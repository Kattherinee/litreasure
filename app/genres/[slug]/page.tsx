import GenrePage from "@/components/pages/GenrePage";

type PageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function GenreRoute({ params }: PageProps) {
	const { slug } = await params;

	return <GenrePage slug={slug} />;
}
