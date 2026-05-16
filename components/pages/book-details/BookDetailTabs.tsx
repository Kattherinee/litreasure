"use client";

import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import Rating from "@mui/material/Rating";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import type { IBook } from "@/shared/api/books";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";

interface IBookDetailTabsProps {
	activeTab?: ITabId;
	book: IBook;
	onActiveTabChange?: (tab: ITabId) => void;
}

export type ITabId = "description" | "quotes" | "reviews";

const tabs: Array<{
	count?: number;
	id: ITabId;
	label: string;
}> = [
	{ id: "description", label: "Description" },
	{ id: "quotes", label: "Quotes" },
	{ id: "reviews", label: "Reviews" },
];

const BookDetailTabs = ({
	activeTab: controlledActiveTab,
	book,
	onActiveTabChange,
}: IBookDetailTabsProps) => {
	const [internalActiveTab, setInternalActiveTab] =
		useState<ITabId>("description");
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
	const [canExpandDescription, setCanExpandDescription] = useState(false);
	const [authModalMode, setAuthModalMode] = useState<IAuthModalMode | null>(null);
	const [reviewRating, setReviewRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [reviewStatus, setReviewStatus] = useState("");
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const descriptionRef = useRef<HTMLParagraphElement | null>(null);
	const description =
		book.description ??
		"Описание для этой книги пока не добавлено. Можно сохранить карточку в коллекцию и вернуться к ней позже.";

	const activeTab = controlledActiveTab ?? internalActiveTab;
	const setActiveTab = onActiveTabChange ?? setInternalActiveTab;

	useEffect(() => {
		const descriptionNode = descriptionRef.current;

		if (!descriptionNode) {
			return;
		}

		const updateDescriptionOverflow = () => {
			if (isDescriptionExpanded) {
				return;
			}

			setCanExpandDescription(
				descriptionNode.scrollHeight > descriptionNode.clientHeight + 1,
			);
		};

		updateDescriptionOverflow();

		const resizeObserver = new ResizeObserver(updateDescriptionOverflow);
		resizeObserver.observe(descriptionNode);

		return () => {
			resizeObserver.disconnect();
		};
	}, [description, isDescriptionExpanded]);

	const requestAuth = () => {
		setAuthModalMode("login");
	};

	const handleRatingSelect = (value: number) => {
		if (!isAuthenticated) {
			requestAuth();
			return;
		}

		setReviewRating(value);
		setReviewStatus("");
	};

	const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!isAuthenticated) {
			requestAuth();
			return;
		}

		if (!reviewRating || !reviewText.trim()) {
			setReviewStatus("Поставьте оценку и напишите отзыв.");
			return;
		}

		setReviewStatus("Отзыв готов к отправке. Позже подключим метод API.");
	};

	return (
		<TabsBlock>
			<Tabs role="tablist" aria-label="Разделы книги">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;

					return (
						<TabButton
							key={tab.id}
							aria-controls={`book-${tab.id}-panel`}
							aria-selected={isActive}
							$isActive={isActive}
							id={`book-${tab.id}-tab`}
							role="tab"
							type="button"
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.label}
							{tab.count ? <Counter>{tab.count}</Counter> : null}
						</TabButton>
					);
				})}
			</Tabs>

			<TabPanel
				aria-labelledby={`book-${activeTab}-tab`}
				id={`book-${activeTab}-panel`}
				role="tabpanel"
			>
				{activeTab === "description" ? (
					<DescriptionWrap>
						<Description
							ref={descriptionRef}
							$isExpanded={isDescriptionExpanded}
						>
							{description}
						</Description>
						{canExpandDescription || isDescriptionExpanded ? (
							<DescriptionToggle
								$isExpanded={isDescriptionExpanded}
								type="button"
								onClick={() =>
									setIsDescriptionExpanded((currentState) => !currentState)
								}
							>
								{isDescriptionExpanded ? "Свернуть" : "Показать больше"}
							</DescriptionToggle>
						) : null}
					</DescriptionWrap>
				) : null}

				{activeTab === "quotes" ? (
					<PlaceholderText>
						Цитаты для этой книги пока не добавлены.
					</PlaceholderText>
				) : null}

				{activeTab === "reviews" ? (
					<ReviewsPanel>
						<PlaceholderText>
							Отзывы для этой книги пока не добавлены.
						</PlaceholderText>

						<ReviewForm onSubmit={handleReviewSubmit}>
							<ReviewFormHeader>
								<ReviewTitle>Оставить отзыв</ReviewTitle>
								{!isAuthenticated ? (
									<ReviewHint>
										Чтобы оставить отзыв, нужно войти в аккаунт.
									</ReviewHint>
								) : null}
							</ReviewFormHeader>
							<ReviewMuiRating
								name="review-rating"
								value={reviewRating}
								onChange={(_, value) => handleRatingSelect(value ?? 0)}
							/>

							<RatingPicker aria-label="Оценка книги">
								{[1, 2, 3, 4, 5].map((value) => {
									const isActive = value <= reviewRating;

									return (
										<RatingButton
											key={value}
											aria-label={`${value} из 5`}
											type="button"
											onClick={() => handleRatingSelect(value)}
										>
											{isActive ? (
												<StarIcon aria-hidden="true" />
											) : (
												<StarBorderIcon aria-hidden="true" />
											)}
										</RatingButton>
									);
								})}
							</RatingPicker>

							<ReviewTextarea
								disabled={!isAuthenticated}
								placeholder={
									isAuthenticated
										? "Что запомнилось, зацепило или не сработало?"
										: "Войдите, чтобы написать отзыв"
								}
								value={reviewText}
								onChange={(event) => {
									setReviewText(event.target.value);
									setReviewStatus("");
								}}
							/>

							<ReviewActions>
								{!isAuthenticated ? (
									<AuthRequiredButton type="button" onClick={requestAuth}>
										Войти и оставить отзыв
									</AuthRequiredButton>
								) : (
									<SubmitReviewButton type="submit">
										Опубликовать
									</SubmitReviewButton>
								)}
							</ReviewActions>

							{reviewStatus ? (
								<ReviewStatus role="status">{reviewStatus}</ReviewStatus>
							) : null}
						</ReviewForm>
					</ReviewsPanel>
				) : null}
			</TabPanel>

			{authModalMode ? (
				<AuthModal
					mode={authModalMode}
					redirectOnSuccess={false}
					onClose={() => setAuthModalMode(null)}
					onModeChange={setAuthModalMode}
				/>
			) : null}
		</TabsBlock>
	);
};

export default BookDetailTabs;

const TabsBlock = styled.section`
	min-width: 0;
	margin-top: 1.6rem;
	overflow: hidden;
`;

const Tabs = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 2rem;

	@media (max-width: 56rem) {
		flex-wrap: wrap;
		gap: 1rem;
	}
`;

const TabButton = styled.button<{ $isActive: boolean }>`
	position: relative;
	display: inline-flex;
	align-items: baseline;
	border: 0;
	background: ${theme.colors.transparent};
	padding: 0 0 0.5rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.black : theme.colors.lightText};
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 1.225rem;
	font-weight: 500;
	line-height: 1.35;
	transition: color 180ms ease;

	&::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 0.1375rem;
		background: ${({ $isActive }) =>
			$isActive ? theme.colors.orangeDark : theme.colors.transparent};
		content: "";
	}

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const Counter = styled.span`
	margin-left: 0.4rem;
	color: ${theme.colors.muted};
	font-family: ${theme.fonts.sans};
	font-size: 1.25rem;
	font-weight: 400;
`;

const TabPanel = styled.div`
	min-width: 0;
	min-height: 8rem;
`;

const DescriptionWrap = styled.div`
	position: relative;
	max-width: 100%;
`;

const Description = styled.p<{ $isExpanded: boolean }>`
	max-width: 100%;
	margin: 1.2rem 0 0;
	overflow: hidden;
	color: ${theme.colors.black};
	font-family: ${theme.fonts.sans};
	font-size: 1.05rem;
	line-height: 1.7;
	overflow-wrap: anywhere;
	${({ $isExpanded }) =>
		$isExpanded
			? ""
			: `
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 4;
			`}

	@media (max-width: 56rem) {
		font-size: 1rem;
	}
`;

const DescriptionToggle = styled.button<{ $isExpanded: boolean }>`
	position: ${({ $isExpanded }) => ($isExpanded ? "static" : "absolute")};
	right: 0;
	bottom: 0.12rem;
	display: block;
	border: 0;
	background: linear-gradient(
		90deg,
		rgb(232 226 222 / 0),
		${theme.colors.background} 3.1rem,
		${theme.colors.background}
	);
	margin-top: ${({ $isExpanded }) => ($isExpanded ? "0.5rem" : "0")};
	margin-left: ${({ $isExpanded }) => ($isExpanded ? "auto" : "0")};
	padding: 0 0 0 3.7rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font-family: ${theme.fonts.sans};
	font-size: 0.95rem;
	line-height: 1.7;
	transition: color 180ms ease;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangePrimary};
		outline: none;
	}
`;

const PlaceholderText = styled.p`
	margin: 1.2rem 0 0;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 1rem;
	line-height: 1.5;
`;

const ReviewsPanel = styled.div`
	max-width: 44rem;
`;

const ReviewForm = styled.form`
	display: flex;
	flex-direction: column;
	gap: 0.85rem;
	margin-top: 1.4rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.2);
	border-radius: 0.75rem;
	background: rgb(242 239 237 / 0.48);
	padding: 1rem;
`;

const ReviewFormHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
`;

const ReviewTitle = styled.h3`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.2rem;
	line-height: 1.2;
`;

const ReviewHint = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.92rem;
	line-height: 1.4;
`;

const ReviewMuiRating = styled(Rating)`
	color: ${theme.colors.orangePrimary};

	& .MuiRating-icon {
		width: 2.35rem;
		height: 2.35rem;
	}

	& .MuiSvgIcon-root {
		width: 1.65rem;
		height: 1.65rem;
	}
`;

const RatingPicker = styled.div`
	display: none;
	gap: 0.15rem;
`;

const RatingButton = styled.button`
	display: inline-grid;
	width: 2.35rem;
	height: 2.35rem;
	place-items: center;
	border: 0;
	background: transparent;
	padding: 0;
	color: ${theme.colors.orangePrimary};
	cursor: pointer;

	& svg {
		width: 1.65rem;
		height: 1.65rem;
	}

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const ReviewTextarea = styled.textarea`
	min-height: 7rem;
	resize: vertical;
	border: 0.0625rem solid ${theme.colors.border};
	border-radius: 0.75rem;
	background: rgb(242 239 237 / 0.86);
	padding: 0.8rem 0.9rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.sans};
	font-size: 1rem;
	line-height: 1.5;

	&:focus,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		outline: none;
	}

	&:disabled {
		color: ${theme.colors.inputDisabledText};
		cursor: not-allowed;
	}
`;

const ReviewActions = styled.div`
	display: flex;
	justify-content: flex-end;
`;

const SubmitReviewButton = styled.button`
	border: 0;
	border-radius: 62.4375rem;
	background: ${theme.colors.orangeLight};
	padding: 0.55rem 1.2rem;
	color: ${theme.colors.invertedText};
	cursor: pointer;
	font-family: ${theme.fonts.serif};
	font-size: 1rem;
	font-weight: 700;
	transition:
		background 180ms ease,
		color 180ms ease;

	&:hover,
	&:focus-visible {
		background: ${theme.colors.bluePrimary};
		outline: none;
	}
`;

const AuthRequiredButton = styled(SubmitReviewButton)`
	background: ${theme.colors.bluePrimary};

	&:hover,
	&:focus-visible {
		background: ${theme.colors.orangeLight};
	}
`;

const ReviewStatus = styled.p`
	margin: -0.25rem 0 0;
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.sans};
	font-size: 0.92rem;
	line-height: 1.4;
`;
