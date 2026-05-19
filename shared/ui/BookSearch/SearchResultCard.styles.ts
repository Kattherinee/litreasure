import Link from "next/link";
import styled from "styled-components";

import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";

export const ResultItem = styled.div`
	display: grid;
	align-items: center;
	gap: 0.9rem;
	grid-template-columns: minmax(0, 1fr) auto;
	border-radius: 0.8rem;
	transition:
		background 160ms ease,
		transform 160ms ease;

	&:hover,
	&:focus-within {
		background: rgb(242 239 237 / 0.78);
		transform: translateY(-0.0625rem);
	}

	@media (max-width: 34rem) {
		grid-template-columns: 1fr;
	}
`;

export const ResultLinkCard = styled(Link)`
	display: grid;
	align-items: center;
	gap: 1.05rem;
	grid-template-columns: 4.5rem minmax(0, 1fr) 1.5rem;
	border-radius: 0.8rem;
	padding: 0.75rem 0.9rem;
	color: inherit;
	text-decoration: none;
	transition:
		background 160ms ease,
		transform 160ms ease;

	&:hover,
	&:focus-visible {
		background: rgb(242 239 237 / 0.78);
		outline: none;
		transform: translateY(-0.0625rem);
	}

	@media (max-width: 34rem) {
		grid-template-columns: 3.75rem minmax(0, 1fr) 1.5rem;
	}
`;

export const ResultEntityCard = styled.div`
	display: grid;
	align-items: center;
	gap: 1.05rem;
	grid-template-columns: 4.5rem minmax(0, 1fr) auto 1.5rem;
	border-radius: 0.8rem;
	padding: 0.75rem 0.9rem;
	transition:
		background 160ms ease,
		transform 160ms ease;

	&:hover,
	&:focus-within {
		background: rgb(242 239 237 / 0.78);
		transform: translateY(-0.0625rem);
	}

	@media (max-width: 34rem) {
		grid-template-columns: 3.75rem minmax(0, 1fr) 1.5rem;
	}
`;

export const ResultArrow = styled.span`
	width: 1rem;
	height: 1rem;
	border-top: 0.22rem solid rgb(4 18 26 / 0.25);
	border-right: 0.22rem solid rgb(4 18 26 / 0.25);
	transform: rotate(45deg);
`;

export const RoundImage = styled.span<{ $photoUrl: string }>`
	width: 4rem;
	height: 4rem;
	border-radius: 50%;
	background:
		center / cover no-repeat url(${({ $photoUrl }) => $photoUrl}),
		rgb(218 142 91 / 0.22);
`;

export const GenreMark = styled.span`
	display: inline-flex;
	width: 4rem;
	height: 4rem;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgb(218 142 91 / 0.18);
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.serif};
	font-size: 2rem;
	line-height: 1;
`;

export const CollectionMark = styled.span`
	position: relative;
	width: 4rem;
	height: 4rem;
	border-radius: 0.9rem;
	background: rgb(218 142 91 / 0.18);

	&::before,
	&::after {
		position: absolute;
		right: 1rem;
		left: 1rem;
		height: 0.2rem;
		border-radius: 999px;
		background: ${theme.colors.orangeDark};
		content: "";
	}

	&::before {
		top: 1.45rem;
	}

	&::after {
		top: 2.25rem;
	}
`;

export const SeriesStack = styled.span`
	position: relative;
	display: block;
	width: 4rem;
	height: 5.2rem;
`;

export const SeriesStackCover = styled.img<{ $index: number }>`
	position: absolute;
	top: ${({ $index }) => $index * 0.25}rem;
	left: ${({ $index }) => $index * -0.25}rem;
	z-index: ${({ $index }) => 3 - $index};
	width: 3.75rem;
	height: 5rem;
	border: 0.0625rem solid ${theme.colors.background};
	border-radius: 0.45rem;
	object-fit: cover;
`;

export const ResultMain = styled.div`
	display: grid;
	align-items: center;
	gap: 0.9rem;
	grid-template-columns: 3.25rem minmax(0, 1fr);
	min-width: 0;
	padding: 0.6rem;
`;

export const ResultCoverLink = styled(Link)`
	display: inline-flex;
	width: 3.25rem;
	height: 4.7rem;
	border-radius: 0.35rem;

	&:focus-visible {
		outline: 0.125rem solid ${theme.colors.orangeLight};
		outline-offset: 0.125rem;
	}
`;

export const ResultLink = styled(Link)`
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.35rem;
	color: ${theme.colors.foreground};
	text-decoration: none;

	&:focus-visible {
		outline: none;
	}
`;

export const ResultCover = styled.img`
	width: 3.25rem;
	height: 4.7rem;
	border-radius: 0.35rem;
	object-fit: cover;
`;

export const ResultMeta = styled.span`
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.35rem;
`;

export const ResultSeries = styled.span`
	display: inline-flex;
	max-width: 100%;
	align-items: center;
	border: 0.0625rem solid rgb(212 100 28 / 0.18);
	border-radius: 62.4375rem;
	background: rgb(242 239 237 / 0.62);
	padding: 0.28rem 0.55rem;
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.sans};
	font-size: 0.72rem;
	font-weight: 600;
	line-height: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const ResultTitle = styled.span`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.05rem;
	font-weight: 500;
	line-height: 1.15;
`;

export const ResultAuthor = styled.span`
	overflow: hidden;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.85rem;
	line-height: 1.3;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const ResultDescription = styled.span`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.82rem;
	line-height: 1.3;
`;

export const WantButton = styled(Button)`
	&& {
		justify-self: end;
		margin-right: 0.6rem;
		white-space: nowrap;

		@media (max-width: 34rem) {
			display: none;
		}
	}
`;
