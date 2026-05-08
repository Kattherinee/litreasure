import BookDetailsPage from "@/components/pages/BookDetailsPage";

type PageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function BookRoute({ params }: PageProps) {
	const { slug } = await params;

	return <BookDetailsPage slug={slug} />;
}
