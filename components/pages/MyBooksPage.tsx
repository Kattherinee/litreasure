"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";

import {
	useDeleteBookTrackingMutation,
	useUserBooksQuery,
	type IUserBookStatus,
	type IUserBookTracking,
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

const statusLabels: Record<IUserBookStatus, string> = {
	dropped: "Брошено",
	finished: "Прочитано",
	paused: "Пауза",
	planned: "В планах",
	reading: "Читаю",
	rereading: "Перечитываю",
};

const MyBooksPage = () => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);
	const deleteTrackingMutation = useDeleteBookTrackingMutation();
	const [page, setPage] = useState(1);
	const [activeStatus, setActiveStatus] = useState<IUserBookStatus | "all">(
		"all",
	);
	const { data, isError, isLoading } = useUserBooksQuery(
		{
			limit: 30,
			page,
			status: activeStatus === "all" ? undefined : activeStatus,
		},
		{ enabled: Boolean(session) },
	);
	const books = data?.items ?? [];
	const pages = data?.pages ?? 1;

	useEffect(() => {
		if (!session) {
			router.replace("/?auth=required");
		}
	}, [router, session]);

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
					<Button buttonType="containedInverted" href="/search">
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
								{isActive && data ? <StatusCount>{data.total}</StatusCount> : null}
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
								<TrackedBook key={item.id}>
									<BookCard book={item.book} />
									<TrackingInfo>{getTrackingInfo(item)}</TrackingInfo>
									<RemoveTrackingButton
										type="button"
										disabled={deleteTrackingMutation.isPending}
										onClick={() => deleteTrackingMutation.mutate(item.book.id)}
									>
										Убрать
									</RemoveTrackingButton>
								</TrackedBook>
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
		</Page>
	);
};

export default MyBooksPage;

const getTrackingInfo = (item: IUserBookTracking) => {
	const parts = [statusLabels[item.status]];

	if (item.currentPage) parts.push(`${item.currentPage} стр.`);
	if (item.readCount) parts.push(`${item.readCount} прочт.`);

	return parts.join(" · ");
};

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
	display: grid;
	gap: 1.4rem 1rem;
	grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
`;

const TrackedBook = styled.article`
	display: grid;
	gap: 0.45rem;
	justify-items: start;
`;

const TrackingInfo = styled.p`
	margin: 0;
	color: ${theme.colors.orangeDark};
	font-size: 0.78rem;
	font-weight: 700;
	line-height: 1.25;
`;

const RemoveTrackingButton = styled.button`
	border: 0;
	background: transparent;
	padding: 0;
	color: ${theme.colors.lightText};
	cursor: pointer;
	font: inherit;
	font-size: 0.76rem;
	line-height: 1.2;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
		text-decoration: underline;
		text-underline-offset: 0.15rem;
	}

	&:disabled {
		cursor: wait;
		opacity: 0.55;
	}
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
