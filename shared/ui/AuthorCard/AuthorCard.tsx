import { theme } from "@/shared/theme";
import Link from "next/link";
import styled from "styled-components";
import { IAuthorPreview } from "../../api/authors";
import { ResultSeries } from "../BookSearch/SearchResultCard.styles";

const AuthorCard = ({ author }: { author: IAuthorPreview }) => {
	const getInitials = (value: string) =>
		value
			.split(/[\s._-]+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join("");
	return (
		<AuthorCardContainer key={author.id} href={`/authors/${author.id}`}>
			<AuthorPhoto $photoUrl={author.photoUrl} aria-hidden={!author.photoUrl}>
				{author.photoUrl ? null : getInitials(author.name)}
			</AuthorPhoto>
			<AuthorMeta>
				<AuthorName>{author.name}</AuthorName>

				<BookCount>{author.bookCount} books</BookCount>
				<AuthorFacts>
					{author.topGenres && author.topGenres.length > 0
						? author.topGenres.map((genre) => (
								<ResultSeries key={genre.id}>{genre.name}</ResultSeries>
							))
						: null}
				</AuthorFacts>
			</AuthorMeta>
		</AuthorCardContainer>
	);
};
export default AuthorCard;
const AuthorPhoto = styled.span<{ $photoUrl?: string }>`
	display: inline-flex;
	width: 5rem;
	height: 5rem;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: ${({ $photoUrl }) =>
		$photoUrl
			? `url("${$photoUrl}") center / cover no-repeat`
			: theme.colors.surface};
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 1.35rem;
	font-weight: 600;
`;
const AuthorCardContainer = styled(Link)`
	display: grid;
	align-items: center;
	gap: 1rem;
	grid-template-columns: 5rem minmax(0, 1fr);
	border-radius: 1rem;
	background: ${theme.colors.white};
	padding: 1rem;
	color: inherit;
	text-decoration: none;
	transition:
		box-shadow 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		box-shadow: 0 0.75rem 1.5rem rgb(4 18 26 / 0.08);
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const AuthorMeta = styled.span`
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 0.35rem;
`;

const AuthorName = styled.span`
	overflow: hidden;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const AuthorFacts = styled.span`
	display: flex;

	flex-wrap: wrap;
	align-items: center;
	gap: 0.35vw;
	color: ${theme.colors.orangeDark};
	font-size: 0.82vw;
	line-height: 1.3vw;
`;
const BookCount = styled.span`
	color: ${theme.colors.orangeDark};
	font-size: 0.82vw;
	line-height: 1.3vw;
`;
