"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import styled from "styled-components";

import type { Book } from "@/shared/api/books";
import { theme } from "@/shared/theme";
import { PlusIcon } from "@/shared/ui/PlusIcon";

export type BookCardData = Book;

type BookCardProps = {
	book: BookCardData;
};

const BookCard = ({ book }: BookCardProps) => {
	const { author, coverUrl, title } = book;
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
			aria-label={`${title}, ${author}`}
			role="link"
			tabIndex={0}
			onClick={openBookPage}
			onKeyDown={handleCardKeyDown}
		>
			<BookCover>
				<BookCoverImage
					src={coverUrl ?? "/images/book-placeholder.svg"}
					alt={`Обложка «${title}»`}
				/>
				<BookAddButton
					type="button"
					aria-label="Добавить в коллекцию"
					onClick={handleAddButtonClick}
					onKeyDown={handleAddButtonKeyDown}
				>
					<PlusIcon />
				</BookAddButton>
			</BookCover>

			<BookMeta>
				<BookTitle>{title}</BookTitle>
				<BookAuthor>{author}</BookAuthor>
			</BookMeta>
		</BookCardWrapper>
	);
};

export default BookCard;

const BookCardWrapper = styled.article`
	position: relative;
	display: flex;
	width: min(100%, 12rem);
	flex-direction: column;
	gap: 0.5rem;
	background: ${theme.colors.transparent};
	box-shadow: none;
	color: ${theme.colors.foreground};
	cursor: pointer;

	&:focus-visible {
		outline: 0.125rem solid ${theme.colors.orangeDark};
		outline-offset: 0.25rem;
	}
`;

const BookCover = styled.div`
	position: relative;
	overflow: hidden;
	width: fit-content;
	max-width: 100%;
	height: 15.25rem;
	border: 0.0625rem solid ${theme.colors.border};
	border-radius: 0.25rem;
	transition: height 220ms ease;

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-visible & {
		transform: scale(1.02);
		transition: transform 300ms ease;
	}
`;

const BookCoverImage = styled.img`
	display: block;
	width: auto;
	max-width: 100%;
	height: 100%;
	object-fit: contain;
`;

const BookMeta = styled.div`
	display: flex;
	flex-direction: column;
`;

const BookTitle = styled.h2`
	margin-block: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.045rem;
	font-weight: 500;
	line-height: 1.55rem;
	transition: color 220ms ease;
	overflow-wrap: anywhere;

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-visible & {
		color: ${theme.colors.orangeDark};
	}
`;

const BookAuthor = styled.p`
	margin-block: 0;
	color: ${theme.colors.lightText};
	font-size: 0.875rem;
	line-height: 1.3334;
	overflow-wrap: anywhere;
`;

const BookAddButton = styled.button`
	position: absolute;
	right: 0.5rem;
	bottom: 0.5rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1.85rem;
	height: 1.85rem;
	border: 0.0625rem solid ${theme.alpha.coverActionBorder};
	border-radius: 50%;
	background: ${theme.alpha.coverActionBackground};
	padding: 0;
	color: ${theme.colors.invertedText};
	cursor: pointer;
	opacity: 0;
	transform: translateY(0.25rem);
	transition:
		background 0.2s ease,
		border-color 0.2s ease,
		color 0.2s ease,
		opacity 0.2s ease,
		transform 0.15s ease;

	& svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	& svg path {
		fill: currentColor;
		transition: fill 0.2s ease;
	}

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangePrimary};
		background: ${theme.colors.orangePrimary};
		color: ${theme.colors.white};
		opacity: 1;
		outline: none;
		transform: translateY(0);
	}

	${BookCardWrapper}:hover &,
	${BookCardWrapper}:focus-within & {
		opacity: 1;
		transform: translateY(0);
	}
`;
