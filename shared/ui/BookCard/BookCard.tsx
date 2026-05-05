"use client";

import Rating from "@mui/material/Rating";
import styled from "styled-components";

import { PlusIcon } from "@/shared/ui/PlusIcon";

export type BookCardData = {
	id: string;
	Author: string;
	rating: number;
	imageUrl: string;
	Name: string;
};

type BookCardProps = {
	book: BookCardData;
};

const BookCard = ({ book }: BookCardProps) => {
	const { Author, Name, imageUrl, rating } = book;

	return (
		<BookCardWrapper aria-label={`${Name}, ${Author}`}>
			<BookCover>
				<BookCoverImage src={imageUrl} alt={`Обложка «${Name}»`} />
			</BookCover>

			<BookMeta>
				<BookTitle>{Name}</BookTitle>
				<BookAuthor>{Author}</BookAuthor>
			</BookMeta>

			<BookFooter>
				<BookRating
					value={rating}
					precision={0.5}
					readOnly
					size="small"
					aria-label={`Рейтинг ${rating} из 5`}
				/>

				<BookAddButton type="button" aria-label="Добавить в коллекцию">
					<PlusIcon />
				</BookAddButton>
			</BookFooter>
		</BookCardWrapper>
	);
};

export default BookCard;

const BookCardWrapper = styled.article`
	display: flex;
	width: auto;
	cursor: pointer;
	flex-direction: column;
	position: relative;
	color: var(--foreground);
	background: transparent;
	box-shadow: none;
	gap: 8px;
`;

const BookCover = styled.div`
	overflow: hidden;
	height: 244px;
	width: auto;
	border: 1px solid var(--border);
	border-radius: 4px;
	transition: height 220ms ease;
`;

const BookCoverImage = styled.img`
	height: 100%;
	width: 100%;
	object-fit: cover;
`;

const BookMeta = styled.div`
	display: flex;
	flex-direction: column;
`;

const BookTitle = styled.h2`
	font-family: var(--font-serif);
	font-size: 18px;
	font-weight: 500;
	line-height: 1.25;
	color: var(--foreground);
	transition: color 220ms ease;

	${BookCardWrapper}:hover & {
		color: var(--orange-dark);
	}
`;

const BookAuthor = styled.p`
	font-size: 14px;
	line-height: 1.3334;
	color: var(--foreground);
`;

const BookFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const BookRating = styled(Rating)`
	.MuiRating-icon {
		font-size: 20px;
	}

	.MuiRating-iconFilled {
		color: var(--orange-primary);
	}

	.MuiRating-iconEmpty {
		color: #d1c5bc;
	}
`;
const BookAddButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 8px;
	background: transparent;
	border: 1px solid var(--orange-dark);

	padding: 0;
	color: var(--orange-dark);
	cursor: pointer;
	transition:
		background 0.2s ease,
		border-color 0.2s ease,
		color 0.2s ease,
		transform 0.15s ease;

	& svg {
		width: 20px;
		height: 20px;
	}

	& svg path {
		fill: currentColor;
		transition: fill 0.2s ease;
	}

	&:hover {
		background: var(--orange-primary);
		border-color: var(--orange-primary);
		color: #fff;
		transform: translateY(-1px);
	}
`;
