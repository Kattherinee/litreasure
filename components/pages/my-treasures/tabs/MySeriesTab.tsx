"use client";

import Link from "next/link";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import styled from "styled-components";

import { theme } from "@/shared/theme";
import { ResultSeries } from "@/shared/ui/BookSearch/SearchResultCard.styles";
import { ViewAllLink } from "@/components/pages/my-treasures/ui";

interface IMySeriesTabProps {
	mySeries: Array<{
		authorName?: string;
		bookCount?: number;
		coverUrl?: string;
		description?: string;
		id: string;
		title: string;
	}>;
}

export const MySeriesTab = ({ mySeries }: IMySeriesTabProps) => (
	<Panel>
		<Header>
			<Row>
				<Title>My Series</Title>
				<ViewAllLink href="/search?tab=series">
					<span>View all</span>
					<KeyboardArrowRightIcon aria-hidden="true" />
				</ViewAllLink>
			</Row>
		</Header>
		{mySeries.length > 0 ? (
			<Grid>
				{mySeries.slice(0, 8).map((series) => (
					<Card key={series.id} href={`/series/${series.id}`}>
						<Stack aria-hidden="true">
							{Array.from({ length: 3 }, (_, index) => (
								<Cover key={index} $coverUrl={series.coverUrl} $index={index} />
							))}
						</Stack>
						<Meta>
							<Name>{series.title}</Name>
							<Text>{series.description || series.authorName || "Saved series"}</Text>
							<BookCount>{series.bookCount ?? 0} books</BookCount>
						</Meta>
					</Card>
				))}
			</Grid>
		) : (
			<Text>Series you follow will appear here.</Text>
		)}
	</Panel>
);

const Panel = styled.div``;
const Header = styled.div`display:flex;justify-content:space-between;margin-bottom:.75rem;`;
const Row = styled.div`display:flex;align-items:center;gap:.85rem;`;
const Title = styled.h2`margin:0;color:${theme.colors.foreground};font-family:${theme.fonts.serif};font-size:1.35rem;`;
const Grid = styled.div`display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(13rem,1fr));`;
const Card = styled(Link)`display:grid;grid-template-columns:3.9rem minmax(0,1fr);gap:.75rem;border:.0625rem solid rgb(211 202 196 / .72);border-radius:.75rem;background:rgb(255 255 255 /.58);padding:.55rem;color:inherit;text-decoration:none;`;
const Stack = styled.span`position:relative;display:block;width:3.9rem;height:4.7rem;`;
const Cover = styled.span<{ $coverUrl?: string; $index: number }>`
	position:absolute;top:${({ $index }) => $index * 0.22}rem;left:${({ $index }) => $index * -0.18}rem;z-index:${({ $index }) => 3 - $index};
	width:3.3rem;height:4.4rem;border:.0625rem solid ${theme.colors.background};border-radius:.42rem;
	background:linear-gradient(rgb(4 18 26 / .05), rgb(4 18 26 / .05)),url("${({ $coverUrl }) => $coverUrl || "/images/book-placeholder.svg"}") center / cover;
`;
const Meta = styled.div`min-width:0;`;
const Name = styled.h3`margin:0;color:${theme.colors.foreground};font-family:${theme.fonts.serif};font-size:1rem;`;
const Text = styled.p`margin:.28rem 0 0;color:${theme.colors.softForeground};font-size:.8rem;`;
const BookCount = styled(ResultSeries)`
	margin-top: 0.3rem;
`;
