import CollectionPage from "@/components/pages/CollectionPage";

type PageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function CollectionRoute({ params }: PageProps) {
	const { slug } = await params;

	return <CollectionPage slug={slug} />;
}
