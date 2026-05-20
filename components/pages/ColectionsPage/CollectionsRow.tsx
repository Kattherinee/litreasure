import {
	getCollection,
	useCreateCollectionMutation,
} from "@/shared/api/collections";
import type { ICollectionPreview } from "@/shared/api/collections";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";
import { PlusIcon } from "@/shared/ui/PlusIcon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import styled from "styled-components";
import { PreviewRail, RowCopy } from "./CollectionsPage";

export const CollectionRow = ({
	collection,
	onAuthRequired,
	showSaveButton = true,
}: {
	collection: ICollectionPreview;
	onAuthRequired: () => void;
	showSaveButton?: boolean;
}) => {
	const router = useRouter();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const createCollectionMutation = useCreateCollectionMutation();
	const [saveStatus, setSaveStatus] = useState("");

	const hiddenBooksCount = Math.max(
		collection.bookCount - collection.previewBooks.length,
		0,
	);
	const ownerLabel =
		collection.source === "open_library"
			? "Litreasure"
			: collection.owner.username || collection.owner.name;

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
				<RowTitle>{collection.title}</RowTitle>

				<RowMeta>
					<OwnerLink>
						<OwnerAvatar src={getCollectionOwnerAvatar(collection)} alt="" />
						<span>{ownerLabel}</span>
					</OwnerLink>
					<BookCount>{collection.bookCount} книг</BookCount>
				</RowMeta>

				{showSaveButton ? (
					<SaveButton
						buttonType="containedInverted"
						disabled={createCollectionMutation.isPending}
						title="Сохранить себе"
						onClick={handleSaveClick}
					>
						<PlusIcon />
						<span> {saveStatus ? "Добавлено" : "Сохранить"}</span>
					</SaveButton>
				) : null}
			</RowCopy>

			<PreviewRail aria-label={`Книги из подборки ${collection.title}`}>
				{collection.previewBooks.length > 0 ? (
					collection.previewBooks.map((book) => (
						<PreviewBook
							key={book.id}
							onClick={(event) => {
								event.stopPropagation();
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

const RowTitle = styled.h2`
	min-width: 0;
	margin: 0;
	overflow: hidden;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.25vw;
	font-weight: 500;
	line-height: 1.65vw;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover {
		text-decoration: underline 1px;
	}
`;

const BookCount = styled.span`
	flex: 0 0 auto;
	color: ${theme.colors.bluePrimary};
	font-family: ${theme.fonts.sans};
	font-size: 0.84vw;
	font-weight: 400;
	letter-spacing: 0.01em;
	line-height: 1rem;
`;

const RowMeta = styled.div`
	display: flex;
	min-height: 1rem;
	align-items: center;
	gap: 0.75rem;
`;

const OwnerLink = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.4vw;
	color: ${theme.colors.orangePrimary};
	font-family: ${theme.fonts.sans};
	font-size: 0.84vw;
	font-weight: 400;
	letter-spacing: 0.01em;
	line-height: 1rem;
	text-decoration: underline;

	&:hover {
		color: ${theme.colors.orangeDark};
	}
`;

const OwnerAvatar = styled.img`
	width: 1.3vw;
	height: 1.3vw;
	border-radius: 50%;
	object-fit: cover;
`;

const SaveButton = styled(Button)`
	&& {
		width: max-content;
		gap: 0.4vw;
		font-weight: 400;
		font-family: ${theme.fonts.sans};
		margin-top: 0.7vw;
		font-size: 0.94vw;
		padding: 0.35vw 1vw 0.4vw;

		svg {
			width: 1vw;
			height: 1vw;
		}
	}
`;

const Row = styled.article`
	position: relative;
	display: flex;
	min-height: 7.5rem;
	align-items: center;
	justify-content: space-between;
	gap: 3.75rem;
	overflow: visible;
	border: 0;
	border-radius: 1rem;
	background: ${theme.colors.white};
	padding: 1.05vw;
	color: inherit;
	cursor: pointer;
	transition:
		box-shadow 180ms ease,
		transform 180ms ease;

	&:hover,
	&:focus-visible {
		box-shadow: 0 0.75rem 1.5rem rgb(4 18 26 / 0.08);
		outline: none;
		transform: translateY(-0.0625rem);
	}

	@media (max-width: 56rem) {
		gap: 1rem;
	}

	@media (max-width: 42rem) {
		flex-direction: column;
		align-items: stretch;
	}
`;

const PreviewBook = styled.span`
	position: relative;
	display: block;
	width: 3.75rem;
	height: 5rem;
	flex: 0 0 auto;
	border-radius: 0.625rem;
	background: #dadada;
	box-shadow: none;
`;

const PreviewCover = styled.img`
	display: block;
	width: 100%;
	height: 100%;
	border-radius: inherit;
	object-fit: cover;
`;

const MoreBooksBadge = styled.span`
	display: inline-flex;
	width: 1.75rem;
	height: 1.75rem;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: #ededed;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.sans};
	font-size: 0.75rem;
	font-weight: 400;
	letter-spacing: 0.01em;
	line-height: 1rem;
`;

const BookTooltip = styled.span`
	position: absolute;
	right: 50%;
	bottom: calc(100% + 0.5rem);
	z-index: 10;
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
