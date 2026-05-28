"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { CreateBookModal } from "@/components/pages/my-books/CreateBookModal";
import {
	useUserBooksQuery,
	type IUserBookStatus,
} from "@/shared/api/user-books";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { AppPagination } from "@/shared/ui/AppPagination";
import { BookCard } from "@/shared/ui/BookCard";
import { Button } from "@/shared/ui/Button";

const statusTabs: Array<{ id: IUserBookStatus | "all"; label: string }> = [
	{ id: "all", label: "Все книги" },
	{ id: "reading", label: "Сейчас читаю" },
	{ id: "planned", label: "В планах" },
	{ id: "finished", label: "Прочитано" },
	{ id: "paused", label: "Пауза" },
	{ id: "rereading", label: "Перечитываю" },
	{ id: "dropped", label: "Брошено" },
];

const MyBooksPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const session = useAuthStore((state) => state.session);
	const [page, setPage] = useState(1);
	const [activeStatus, setActiveStatus] = useState<IUserBookStatus | "all">(
		"all",
	);
	const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);

	const allBooksQuery = useUserBooksQuery(
		{
			limit: 30,
			page,
		},
		{ enabled: Boolean(session) },
	);
	const readingBooksQuery = useUserBooksQuery(
		{ limit: 30, page, status: "reading" },
		{ enabled: Boolean(session) },
	);
	const plannedBooksQuery = useUserBooksQuery(
		{ limit: 30, page, status: "planned" },
		{ enabled: Boolean(session) },
	);
	const finishedBooksQuery = useUserBooksQuery(
		{ limit: 30, page, status: "finished" },
		{ enabled: Boolean(session) },
	);
	const pausedBooksQuery = useUserBooksQuery(
		{ limit: 30, page, status: "paused" },
		{ enabled: Boolean(session) },
	);
	const rereadingBooksQuery = useUserBooksQuery(
		{ limit: 30, page, status: "rereading" },
		{ enabled: Boolean(session) },
	);
	const droppedBooksQuery = useUserBooksQuery(
		{ limit: 30, page, status: "dropped" },
		{ enabled: Boolean(session) },
	);
	const queriesByStatus = {
		all: allBooksQuery,
		dropped: droppedBooksQuery,
		finished: finishedBooksQuery,
		paused: pausedBooksQuery,
		planned: plannedBooksQuery,
		reading: readingBooksQuery,
		rereading: rereadingBooksQuery,
	} satisfies Record<IUserBookStatus | "all", typeof allBooksQuery>;
	const activeBooksQuery = queriesByStatus[activeStatus];
	const { data, isError, isLoading } = activeBooksQuery;
	const books = data?.items ?? [];
	const pages = data?.pages ?? 1;

	useEffect(() => {
		if (!session) {
			router.replace("/?auth=required");
		}
	}, [router, session]);

	useEffect(() => {
		if (session && searchParams.get("create") === "1") {
			setIsCreateBookOpen(true);
		}
	}, [searchParams, session]);

	if (!session) {
		return null;
	}

	return (
		<Page>
			<Content>
				<Hero>
					<HeroCopy>
						<Title>Мои книги</Title>
						<Lead>Все книги, которые вы добавили в свои сокровища.</Lead>
					</HeroCopy>
					<Button
						buttonType="containedInverted"
						type="button"
						onClick={() => setIsCreateBookOpen(true)}
					>
						Добавить книгу
					</Button>
				</Hero>

				<StatusTabs aria-label="Статусы книг">
					{statusTabs.map((status) => {
						const isActive = activeStatus === status.id;

						return (
							<StatusTab
								key={status.id}
								$isActive={isActive}
								type="button"
								onClick={() => {
									setActiveStatus(status.id);
									setPage(1);
								}}
							>
								{status.label}
								{queriesByStatus[status.id].data ? (
									<StatusCount>
										{queriesByStatus[status.id].data?.total ?? 0}
									</StatusCount>
								) : null}
							</StatusTab>
						);
					})}
				</StatusTabs>

				{isLoading ? (
					<StateMessage>Загружаем книги...</StateMessage>
				) : isError ? (
					<StateMessage>Не удалось загрузить ваши книги.</StateMessage>
				) : books.length > 0 ? (
					<>
						<BookGrid>
							{books.map((item) => (
								<BookItem key={item.id}>
									<BookCard
										book={{
											...item.book,
											isTracked: true,
											myStatus: item.status,
										}}
									/>
								</BookItem>
							))}
						</BookGrid>
						<AppPagination count={pages} page={page} onChange={setPage} />
					</>
				) : (
					<EmptyState>
						<EmptyTitle>Книг пока нет</EmptyTitle>
						<EmptyText>
							Добавьте книгу и назначьте ей статус, чтобы она появилась здесь.
						</EmptyText>
					</EmptyState>
				)}
			</Content>

			{isCreateBookOpen ? (
				<CreateBookModal
					onClose={() => setIsCreateBookOpen(false)}
					onCreated={(book) => router.push(`/books/${book.id}`)}
				/>
			) : null}
		</Page>
	);
};

export default MyBooksPage;

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding: 4rem 0 6rem;
`;

const Content = styled.div`
	width: min(calc(100% - (${theme.layout.contentGutter} * 2)), 74rem);
	margin: 0 auto;
`;

const Hero = styled.section`
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1.5rem;

	@media (max-width: 42rem) {
		align-items: flex-start;
		flex-direction: column;
	}
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const Title = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(3rem, 8vw, 5.5rem);
	line-height: 0.95;
`;

const Lead = styled.p`
	max-width: 36rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.05rem;
	line-height: 1.5;
`;

const StatusTabs = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
	margin-bottom: 1.25rem;
`;

const StatusTab = styled.button<{ $isActive: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	border: 0.0625rem solid
		${({ $isActive }) =>
			$isActive ? theme.colors.orangeLight : "rgb(211 202 196 / 0.82)"};
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.14)" : theme.colors.surface};
	padding: 0.45rem 0.85rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.9rem;
	font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const StatusCount = styled.span`
	color: ${theme.colors.orangeDark};
	font-weight: 700;
`;

const BookGrid = styled.div`
	--book-card-column: 8rem;

	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, var(--book-card-column));
	justify-content: start;
	margin-top: clamp(2.5rem, 5vw, 4rem);
`;

const BookItem = styled.div`
	width: fit-content;
`;

const StateMessage = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const EmptyState = styled.section`
	border: 0.0625rem dashed ${theme.colors.border};
	border-radius: 1rem;
	background: rgb(255 255 255 / 0.54);
	padding: 1.5rem;
`;

const EmptyTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.5rem;
	line-height: 1.15;
`;

const EmptyText = styled.p`
	max-width: 36rem;
	margin: 0.5rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;
