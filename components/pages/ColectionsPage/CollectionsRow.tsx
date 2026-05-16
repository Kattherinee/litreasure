import {
	getCollection,
	ICollectionPreview,
	useCreateCollectionMutation,
} from "@/shared/api/collections";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import styled from "styled-components";
import { PreviewRail, RowCopy } from "./CollectionsPage";
import { PlusIcon } from "@/shared/ui/PlusIcon";
import { Button } from "@/shared/ui/Button";

import { GenrePill } from "@/shared/ui/GenrePill";

export const CollectionRow = ({
	collection,
	onAuthRequired,
}: {
	collection: ICollectionPreview;
	onAuthRequired: () => void;
}) => {
	const router = useRouter();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const createCollectionMutation = useCreateCollectionMutation();
	const [saveStatus, setSaveStatus] = useState("");

	const hiddenBooksCount = Math.max(
		collection.bookCount - collection.previewBooks.length,
		0,
	);
	const sourceLabel =
		collection.source === "open_library" ? "Litreasure" : "Пользователь";

	const openCollection = () => {
		router.push(`/collections/${collection.id}`);
	};

	const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key !== "Enter" && event.key !== " ") return;

		event.preventDefault();
		openCollection();
	};

	const handleSaveClick = async (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setSaveStatus("");

		if (!isAuthenticated) {
			onAuthRequired();
			return;
		}

		try {
			const details = await getCollection(collection.id);

			await createCollectionMutation.mutateAsync({
				bookIds: details.books.map((book) => book.id),
				description: details.description,
				isPublic: false,
				title: details.title,
			});
			setSaveStatus("Сохранено");
		} catch (error) {
			setSaveStatus(
				error instanceof Error ? error.message : "Не удалось сохранить",
			);
		}
	};
	const getCollectionOwnerAvatar = (collection: ICollectionPreview) => {
		if (collection.source === "open_library") return "/favicon.ico";

		return collection.owner.avatarUrl || "/favicon.ico";
	};

	return (
		<Row
			aria-label={`Открыть подборку ${collection.title}`}
			role="link"
			tabIndex={0}
			onClick={openCollection}
			onKeyDown={handleRowKeyDown}
		>
			<RowCopy>
				<HeadRow>
					{" "}
					<RowMeta>
						<OwnerPill>
							<OwnerAvatar src={getCollectionOwnerAvatar(collection)} alt="" />
							<span>{collection.owner.name}</span>
						</OwnerPill>
						•
						<OwnerPill>
							{" "}
							<span>{collection.bookCount}</span>
							<span>books</span>
						</OwnerPill>{" "}
					</RowMeta>
					<TitleRow>
						{collection.topGenres.map((genre) => (
							<GenrePill
								fontSize="0.715rem"
								height="1.4rem"
								paddingBlock="0.3rem"
								paddingInline="0.7rem"
								href={`/genres/${genre.id}`}
								key={genre.id}
								color={theme.colors.bluePrimary}
								backgroundColor={theme.colors.background}
							>
								{genre.name}
							</GenrePill>
						))}
					</TitleRow>
				</HeadRow>
				<TitleRow>
					<RowTitle>{collection.title}</RowTitle>
					<SaveButton
						buttonType="containedInverted"
						disabled={createCollectionMutation.isPending}
						title="Сохранить себе"
						onClick={handleSaveClick}
					>
						<PlusIcon />
					</SaveButton>
				</TitleRow>

				{saveStatus ? (
					<SaveStatus role="status">{saveStatus}</SaveStatus>
				) : null}
			</RowCopy>

			<PreviewRail aria-label={`Книги из подборки ${collection.title}`}>
				{collection.previewBooks.length > 0 ? (
					collection.previewBooks.map((book) => (
						<PreviewBook
							key={book.id}
							onClick={(e) => {
								e.stopPropagation();
								router.push(`/books/${book.id}`);
							}}
						>
							<PreviewCover
								src={book.coverUrl || "/images/book-placeholder.svg"}
								alt={`Обложка «${book.title}»`}
							/>
							<BookTooltip>
								<TooltipTitle>{book.title}</TooltipTitle>
								<TooltipAuthor>{book.author}</TooltipAuthor>
							</BookTooltip>
						</PreviewBook>
					))
				) : (
					<EmptyPreview>В подборке пока нет книг.</EmptyPreview>
				)}
				{hiddenBooksCount > 0 ? (
					<MoreBooksBadge>+{hiddenBooksCount}</MoreBooksBadge>
				) : null}
			</PreviewRail>
		</Row>
	);
};

const RowMeta = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.45rem;
	color: ${theme.colors.orangeDark};
`;

const OwnerPill = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.72rem;
	font-weight: 800;
	line-height: 1.2;
`;

const OwnerAvatar = styled.img`
	width: 1.2rem;
	height: 1.2rem;
	border-radius: 50%;
	object-fit: cover;
`;

const TitleRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.55rem;
`;

const HeadRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.85rem;
`;

const SaveStatus = styled.p`
	margin: 0;
	color: ${theme.colors.orangeDark};
	font-size: 0.78rem;
	font-weight: 700;
	line-height: 1.3;
`;

const RowTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(1.05rem, 1.8vw, 1.35rem);
	font-weight: 600;
	line-height: 1.05;
	overflow-wrap: anywhere;
`;

const RowDescription = styled.p`
	display: -webkit-box;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.9rem;
	line-height: 1.45;
`;
const MoreBooksBadge = styled.span`
	display: inline-flex;
	width: 2.3rem;
	height: 2.3rem;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	border-radius: 50%;
	margin-left: 0.7rem;
	color: ${theme.colors.bluePrimary};
	background-color: ${theme.colors.background};
	font-size: 0.9rem;
	font-weight: 500;
	line-height: 1;
`;

const SaveButton = styled(Button)`
	&& {
		svg {
			width: 0.95rem;
			height: 0.95rem;
		}

		height: 1.4rem;
		margin-left: 1rem;
	}
`;
const Row = styled.article`
	position: relative;
	display: grid;
	grid-template-columns: minmax(14rem, 1fr) auto;
	gap: clamp(1.3rem, 3.4vw, 3rem);
	align-items: center;
	overflow: visible;
	border: 0.0625rem solid rgb(35 61 77 / 0.1);
	border-radius: 0.5rem;
	background: rgb(242 239 237 / 0.66);
	padding: clamp(0.8rem, 2vw, 1.1rem);
	color: inherit;
	box-shadow: 0 0.75rem 1.6rem rgb(4 18 26 / 0.05);
	cursor: pointer;
	transition:
		border-color 180ms ease,
		box-shadow 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		border-color: rgb(212 100 28 / 0.38);
		box-shadow: 0 1rem 2rem rgb(4 18 26 / 0.09);
		outline: none;
		transform: translateY(-0.0625rem);
	}

	@media (max-width: 56rem) {
		grid-template-columns: 1fr;
		align-items: start;
	}
`;
const PreviewCover = styled.img`
	display: block;
	width: 100%;
	height: 100%;
	border-radius: inherit;
	object-fit: cover;
`;
const PreviewBook = styled.span`
	position: relative;
	display: block;
	width: 4.75rem;
	height: 6.25rem;
	border-radius: 0.45rem;
	background: ${theme.colors.surface};
	box-shadow: 0 0.3rem 0.85rem rgb(4 18 26 / 0.1);
`;

const BookTooltip = styled.span`
	position: absolute;
	z-index: 10;
	right: 50%;
	bottom: calc(100% + 0.5rem);
	width: max-content;
	max-width: 14rem;
	border: 0.0625rem solid rgb(35 61 77 / 0.1);
	border-radius: 0.55rem;
	background: ${theme.colors.surface};
	padding: 0.5rem 0.65rem;
	box-shadow: 0 0.8rem 1.6rem rgb(4 18 26 / 0.16);
	opacity: 0;
	pointer-events: none;
	transform: translate(50%, 0.25rem);
	transition:
		opacity 150ms ease,
		transform 170ms ease;

	${PreviewBook}:hover & {
		opacity: 1;
		transform: translate(50%, 0);
	}

	&::after {
		position: absolute;
		right: calc(50% - 0.35rem);
		bottom: -0.35rem;
		width: 0.7rem;
		height: 0.7rem;
		background: inherit;
		content: "";
		transform: rotate(45deg);
	}
`;

const TooltipTitle = styled.span`
	display: block;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 0.9rem;
	font-weight: 600;
	line-height: 1.15;
`;

const TooltipAuthor = styled.span`
	display: block;
	margin-top: 0.18rem;
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	line-height: 1.25;
`;

const EmptyPreview = styled.p`
	grid-column: 1 / -1;
	margin: 0;
	border: 0.0625rem dashed ${theme.colors.border};
	border-radius: 0.5rem;
	padding: 1rem;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.5;
`;
