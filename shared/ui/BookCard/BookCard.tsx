"use client";

import Rating from "@mui/material/Rating";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
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
	const router = useRouter();

	const openBookPage = () => {
		router.push(`/books/${book.id}`);
	};

	const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key !== "Enter" && event.key !== " ") {
			return;
		}

		event.preventDefault();
		openBookPage();
	};

	const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
	};

	const handleAddButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		event.stopPropagation();
	};

	return (
		<BookCardWrapper
			aria-label={`${Name}, ${Author}`}
			role="link"
			tabIndex={0}
			onClick={openBookPage}
			onKeyDown={handleCardKeyDown}
		>
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

				<BookAddButton
					type="button"
					aria-label="Добавить в коллекцию"
					onClick={handleAddButtonClick}
					onKeyDown={handleAddButtonKeyDown}
				>
					<PlusIcon />
				</BookAddButton>
			</BookFooter>
		</BookCardWrapper>
	);
};

export default BookCard;

const BookCardWrapper = styled.article`
	position: relative;
	display: flex;
	width: auto;
	flex-direction: column;
	gap: 0.5rem;
	background: transparent;
	box-shadow: none;
	color: var(--foreground);
	cursor: pointer;

	&:focus-visible {
		outline: 0.125rem solid var(--orange-dark);
		outline-offset: 0.25rem;
	}
`;

const BookCover = styled.div`
	overflow: hidden;
	width: auto;
	height: 15.25rem;
	border: 0.0625rem solid var(--border);
	border-radius: 0.25rem;
	transition: height 220ms ease;
`;

const BookCoverImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const BookMeta = styled.div`
	display: flex;
	flex-direction: column;
`;

const BookTitle = styled.h2`
	margin-block: 0;
	color: var(--foreground);
	font-family: var(--font-serif);
	font-size: 1.125rem;
	font-weight: 500;
	line-height: 1.375rem;
	transition: color 220ms ease;

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-visible & {
		color: var(--orange-dark);
	}
`;

const BookAuthor = styled.p`
	margin-block: 0;
	color: var(--foreground);
	font-size: 0.875rem;
	line-height: 1.3334;
`;

const BookFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const BookRating = styled(Rating)`
	.MuiRating-icon {
		font-size: 1.25rem;
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
	width: 1.75rem;
	height: 1.75rem;
	border: 0.0625rem solid var(--orange-dark);
	border-radius: 0.5rem;
	background: transparent;
	padding: 0;
	color: var(--orange-dark);
	cursor: pointer;
	transition:
		background 0.2s ease,
		border-color 0.2s ease,
		color 0.2s ease,
		transform 0.15s ease;

	& svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	& svg path {
		fill: currentColor;
		transition: fill 0.2s ease;
	}

	&:hover {
		border-color: var(--orange-primary);
		background: var(--orange-primary);
		color: #fff;
		transform: translateY(-0.0625rem);
	}
`;
