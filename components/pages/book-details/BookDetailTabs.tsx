"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import type { Book } from "@/shared/api/books";
import { theme } from "@/shared/theme";

type BookDetailTabsProps = {
	book: Book;
};

type TabId = "description" | "quotes" | "reviews";

const tabs: Array<{
	count?: number;
	id: TabId;
	label: string;
}> = [
	{ id: "description", label: "Description" },
	{ id: "quotes", label: "Quotes" },
	{ id: "reviews", label: "Reviews" },
];

const BookDetailTabs = ({ book }: BookDetailTabsProps) => {
	const [activeTab, setActiveTab] = useState<TabId>("description");
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
	const [canExpandDescription, setCanExpandDescription] = useState(false);
	const descriptionRef = useRef<HTMLParagraphElement | null>(null);
	const description =
		book.description ??
		"Описание для этой книги пока не добавлено. Можно сохранить карточку в коллекцию и вернуться к ней позже.";
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
					<PlaceholderText>
						Отзывы для этой книги пока не добавлены.
					</PlaceholderText>
				) : null}
			</TabPanel>
		</TabsBlock>
	);
};

export default BookDetailTabs;

const TabsBlock = styled.section`
	margin-top: 1.6rem;
	min-width: 0;
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
	color: ${theme.colors.black};
	font-family: ${theme.fonts.sans};
	font-size: 1.05rem;
	line-height: 1.7;
	overflow: hidden;
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
