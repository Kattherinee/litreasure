"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import styled from "styled-components";

import {
	type IBookChallenge,
	type IChallengePeriodType,
	type IChallengeType,
	type ICreateBookChallengePayload,
	useChallengesQuery,
	useCreateChallengeMutation,
	useDeleteChallengeMutation,
	useUpdateChallengeMutation,
} from "@/shared/api/book-challenge";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";

const periodOptions: Array<{ label: string; value: IChallengePeriodType }> = [
	{ label: "Неделя", value: "week" },
	{ label: "Месяц", value: "month" },
	{ label: "Год", value: "year" },
];

const typeOptions: Array<{ label: string; unit: string; value: IChallengeType }> = [
	{ label: "Книги", unit: "книг", value: "books" },
	{ label: "Страницы", unit: "страниц", value: "pages" },
];

interface IChallengeFormState {
	type: IChallengeType;
	periodType: IChallengePeriodType;
	targetValue: string;
	startDate: string;
	endDate: string;
	isActive: boolean;
}

type IChallengeModalMode = "create" | "edit";

const getDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const getDefaultEndDate = (periodType: IChallengePeriodType, startDate: string) => {
	const endDate = new Date(`${startDate}T00:00:00`);

	if (periodType === "week") {
		endDate.setDate(endDate.getDate() + 6);
	} else if (periodType === "month") {
		endDate.setMonth(endDate.getMonth() + 1);
		endDate.setDate(endDate.getDate() - 1);
	} else {
		endDate.setFullYear(endDate.getFullYear() + 1);
		endDate.setDate(endDate.getDate() - 1);
	}

	return getDateInputValue(endDate);
};

const createDefaultForm = (): IChallengeFormState => {
	const startDate = getDateInputValue(new Date());

	return {
		endDate: getDefaultEndDate("year", startDate),
		isActive: true,
		periodType: "year",
		startDate,
		targetValue: "24",
		type: "books",
	};
};

const getFormFromChallenge = (
	challenge: IBookChallenge,
): IChallengeFormState => ({
	endDate: challenge.endDate.slice(0, 10),
	isActive: challenge.isActive,
	periodType: challenge.periodType,
	startDate: challenge.startDate.slice(0, 10),
	targetValue: String(challenge.targetValue),
	type: challenge.type,
});

const getPayload = (form: IChallengeFormState): ICreateBookChallengePayload => ({
	endDate: form.endDate,
	isActive: form.isActive,
	periodType: form.periodType,
	startDate: form.startDate,
	targetValue: Math.max(1, Math.round(Number(form.targetValue) || 1)),
	type: form.type,
});

const getPeriodLabel = (period: IChallengePeriodType) =>
	periodOptions.find((option) => option.value === period)?.label ?? period;

const getTypeOption = (type: IChallengeType) =>
	typeOptions.find((option) => option.value === type) ?? typeOptions[0];

const clampPercent = (value?: number) =>
	Math.max(0, Math.min(100, Number.isFinite(value ?? NaN) ? (value as number) : 0));

const formatDate = (value: string) =>
	new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(value));

const BookChallengesPage = () => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);
	const isSessionReady = Boolean(session);
	const { data: challenges = [], isError, isLoading } = useChallengesQuery({
		enabled: isSessionReady,
	});
	const createMutation = useCreateChallengeMutation();
	const updateMutation = useUpdateChallengeMutation();
	const deleteMutation = useDeleteChallengeMutation();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [modalMode, setModalMode] = useState<IChallengeModalMode | null>(null);
	const [form, setForm] = useState<IChallengeFormState>(() =>
		createDefaultForm(),
	);
	const isMutating =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;
	const activeIndex = challenges.length
		? Math.min(selectedIndex, challenges.length - 1)
		: 0;
	const selectedChallenge = challenges[activeIndex] ?? null;

	useEffect(() => {
		if (!session) {
			router.replace("/?auth=required");
		}
	}, [router, session]);

	if (!session) return null;

	const openCreateModal = () => {
		setForm(createDefaultForm());
		setModalMode("create");
	};

	const openEditModal = (challenge: IBookChallenge) => {
		setForm(getFormFromChallenge(challenge));
		setModalMode("edit");
	};

	const closeModal = () => setModalMode(null);

	const handlePeriodChange = (periodType: IChallengePeriodType) => {
		setForm((current) => ({
			...current,
			endDate: getDefaultEndDate(periodType, current.startDate),
			periodType,
		}));
	};

	const handleStartDateChange = (startDate: string) => {
		setForm((current) => ({
			...current,
			endDate: getDefaultEndDate(current.periodType, startDate),
			startDate,
		}));
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (modalMode === "edit" && selectedChallenge) {
			updateMutation.mutate(
				{ id: selectedChallenge.id, payload: getPayload(form) },
				{ onSuccess: closeModal },
			);
			return;
		}

		createMutation.mutate(getPayload(form), {
			onSuccess: () => {
				closeModal();
				setSelectedIndex(0);
			},
		});
	};

	const handleDelete = () => {
		if (!selectedChallenge) return;

		deleteMutation.mutate(selectedChallenge.id, {
			onSuccess: closeModal,
		});
	};

	const handleActivate = () => {
		if (!selectedChallenge) return;

		updateMutation.mutate({
			id: selectedChallenge.id,
			payload: { isActive: true },
		});
	};

	const goToPrev = () => {
		setSelectedIndex(
			challenges.length
				? (activeIndex - 1 + challenges.length) % challenges.length
				: 0,
		);
	};

	const goToNext = () => {
		setSelectedIndex(
			challenges.length ? (activeIndex + 1) % challenges.length : 0,
		);
	};

	return (
		<Page>
			<Content>
				<Hero>
					<HeroTop>
						<BackLink href="/treasures">Мои сокровища</BackLink>
						<NewButton type="button" onClick={openCreateModal}>
							Новый вызов
						</NewButton>
					</HeroTop>
					<Title>Книжные вызовы</Title>
					<Lead>
						Следи за целями по книгам и страницам: прогресс чтения и время
						идут рядом, чтобы было видно не только сколько осталось, но и в
						каком темпе ты движешься.
					</Lead>
				</Hero>

				{isLoading ? (
					<StateMessage>Загружаем вызовы...</StateMessage>
				) : isError ? (
					<StateMessage>Не удалось загрузить книжные вызовы.</StateMessage>
				) : challenges.length > 0 && selectedChallenge ? (
					<>
						<CarouselStage>
							<ArrowButton type="button" onClick={goToPrev}>
								‹
							</ArrowButton>
							<ChallengeSpotlight challenge={selectedChallenge} />
							<ArrowButton type="button" onClick={goToNext}>
								›
							</ArrowButton>
						</CarouselStage>

						<CarouselDots aria-label="Выбор вызова">
							{challenges.map((challenge, index) => (
								<DotButton
									key={challenge.id}
									type="button"
									$isActive={index === activeIndex}
									aria-label={`Показать вызов ${index + 1}`}
									onClick={() => setSelectedIndex(index)}
								/>
							))}
						</CarouselDots>

						<ActionsRow>
							<ActionButton
								type="button"
								onClick={() => openEditModal(selectedChallenge)}
							>
								Редактировать
							</ActionButton>
							<ActionButton
								disabled={selectedChallenge.isActive || isMutating}
								type="button"
								onClick={handleActivate}
							>
								Сделать активным
							</ActionButton>
						</ActionsRow>

						<DetailsPanel>
							<ChallengeDetails challenge={selectedChallenge} />
						</DetailsPanel>
					</>
				) : (
					<EmptyState>
						<EmptyTitle>Пока нет книжных вызовов</EmptyTitle>
						<EmptyText>
							Создай первый вызов и выбери цель так же спокойно, как в
							приветствии: период, тип цели и число, к которому хочется прийти.
						</EmptyText>
						<Button buttonType="containedInverted" type="button" onClick={openCreateModal}>
							Создать вызов
						</Button>
					</EmptyState>
				)}
			</Content>

			{modalMode ? (
				<ChallengeModal
					form={form}
					isMutating={isMutating}
					mode={modalMode}
					selectedChallenge={selectedChallenge}
					onClose={closeModal}
					onDelete={handleDelete}
					onPeriodChange={handlePeriodChange}
					onStartDateChange={handleStartDateChange}
					onSubmit={handleSubmit}
					onUpdateForm={setForm}
				/>
			) : null}
		</Page>
	);
};

export default BookChallengesPage;

const ChallengeSpotlight = ({ challenge }: { challenge: IBookChallenge }) => {
	const valuePercent = clampPercent(challenge.progress?.value.percent);
	const timePercent = clampPercent(challenge.progress?.time.percent);
	const typeOption = getTypeOption(challenge.type);

	return (
		<SpotlightCard>
			<RingColumn>
				<RingProgress
					color="#da8e5b"
					label="цель"
					value={valuePercent}
					footnote={`${challenge.progress?.value.current ?? 0} / ${
						challenge.progress?.value.target ?? challenge.targetValue
					} ${typeOption.unit}`}
				/>
			</RingColumn>
			<SpotlightCenter>
				<SpotlightEyebrow>
					{typeOption.label} · {getPeriodLabel(challenge.periodType)}
				</SpotlightEyebrow>
				<SpotlightTitle>{challenge.targetValue}</SpotlightTitle>
				<SpotlightSubtitle>{typeOption.unit}</SpotlightSubtitle>
				<DateRange>
					{formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
				</DateRange>
				{challenge.isActive ? <ActiveBadge>Активный</ActiveBadge> : null}
			</SpotlightCenter>
			<RingColumn>
				<RingProgress
					color="#233d4d"
					label="время"
					value={timePercent}
					footnote={`осталось ${challenge.progress?.time.remainingDays ?? 0} дн.`}
				/>
			</RingColumn>
		</SpotlightCard>
	);
};

const RingProgress = ({
	color,
	footnote,
	label,
	value,
}: {
	color: string;
	footnote: string;
	label: string;
	value: number;
}) => {
	const radius = 48;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (circumference * value) / 100;

	return (
		<RingBox>
			<RingSvg height="132" viewBox="0 0 132 132" width="132">
				<circle
					cx="66"
					cy="66"
					fill="none"
					r={radius}
					stroke="rgb(35 61 77 / 0.12)"
					strokeWidth="12"
				/>
				<circle
					cx="66"
					cy="66"
					fill="none"
					r={radius}
					stroke={color}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					strokeWidth="12"
				/>
			</RingSvg>
			<RingValue>{Math.round(value)}%</RingValue>
			<RingLabel>{label}</RingLabel>
			<RingFootnote>{footnote}</RingFootnote>
		</RingBox>
	);
};

const ChallengeDetails = ({ challenge }: { challenge: IBookChallenge }) => {
	const progress = challenge.progress;

	if (!progress) {
		return <PanelText>Backend пока не вернул progress для этого вызова.</PanelText>;
	}

	const unit = progress.value.unit === "pages" ? "страниц" : "книг";

	return (
		<DetailsGrid>
			<Metric>
				<MetricValue>
					{progress.value.current} / {progress.value.target}
				</MetricValue>
				<MetricLabel>{unit} выполнено</MetricLabel>
			</Metric>
			<Metric>
				<MetricValue>{progress.value.remaining}</MetricValue>
				<MetricLabel>осталось до цели</MetricLabel>
			</Metric>
			<Metric>
				<MetricValue>{progress.time.elapsedDays}</MetricValue>
				<MetricLabel>дней прошло</MetricLabel>
			</Metric>
			<Metric>
				<MetricValue>{progress.time.remainingDays}</MetricValue>
				<MetricLabel>дней осталось</MetricLabel>
			</Metric>
		</DetailsGrid>
	);
};

interface IChallengeModalProps {
	form: IChallengeFormState;
	isMutating: boolean;
	mode: IChallengeModalMode;
	selectedChallenge: IBookChallenge | null;
	onClose: () => void;
	onDelete: () => void;
	onPeriodChange: (periodType: IChallengePeriodType) => void;
	onStartDateChange: (startDate: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onUpdateForm: (
		value:
			| IChallengeFormState
			| ((current: IChallengeFormState) => IChallengeFormState),
	) => void;
}

const ChallengeModal = ({
	form,
	isMutating,
	mode,
	selectedChallenge,
	onClose,
	onDelete,
	onPeriodChange,
	onStartDateChange,
	onSubmit,
	onUpdateForm,
}: IChallengeModalProps) => {
	const target = Math.max(1, Math.round(Number(form.targetValue) || 1));
	const targetMax = form.type === "pages" ? 5000 : 120;

	return (
		<ModalOverlay role="presentation" onMouseDown={onClose}>
			<ModalDialog
				aria-modal="true"
				role="dialog"
				aria-labelledby="challenge-modal-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<ModalHeader>
					<ModalTitle id="challenge-modal-title">
						{mode === "edit" ? "Редактировать вызов" : "Новый книжный вызов"}
					</ModalTitle>
					<CloseButton type="button" aria-label="Закрыть" onClick={onClose}>
						×
					</CloseButton>
				</ModalHeader>
				<Form onSubmit={onSubmit}>
					<Fieldset>
						<FieldsetLabel>Что считаем</FieldsetLabel>
						<Segmented>
							{typeOptions.map((option) => (
								<SegmentButton
									key={option.value}
									type="button"
									$isActive={form.type === option.value}
									onClick={() =>
										onUpdateForm((current) => ({
											...current,
											targetValue:
												option.value === "pages" ? "1200" : current.targetValue,
											type: option.value,
										}))
									}
								>
									{option.label}
								</SegmentButton>
							))}
						</Segmented>
					</Fieldset>

					<Fieldset>
						<FieldsetLabel>Период</FieldsetLabel>
						<Segmented>
							{periodOptions.map((option) => (
								<SegmentButton
									key={option.value}
									type="button"
									$isActive={form.periodType === option.value}
									onClick={() => onPeriodChange(option.value)}
								>
									{option.label}
								</SegmentButton>
							))}
						</Segmented>
					</Fieldset>

					<TargetBox>
						<TargetTop>
							<FieldsetLabel>Цель</FieldsetLabel>
							<TargetValue>
								{target} {getTypeOption(form.type).unit}
							</TargetValue>
						</TargetTop>
						<Range
							min={1}
							max={targetMax}
							step={form.type === "pages" ? 50 : 1}
							type="range"
							value={target}
							onChange={(event) =>
								onUpdateForm((current) => ({
									...current,
									targetValue: event.target.value,
								}))
							}
						/>
						<Input
							min={1}
							type="number"
							value={form.targetValue}
							onChange={(event) =>
								onUpdateForm((current) => ({
									...current,
									targetValue: event.target.value,
								}))
							}
						/>
					</TargetBox>

					<DateGrid>
						<Field>
							<Label>Дата начала</Label>
							<Input
								type="date"
								value={form.startDate}
								onChange={(event) => onStartDateChange(event.target.value)}
							/>
						</Field>
						<Field>
							<Label>Дата окончания</Label>
							<Input
								type="date"
								value={form.endDate}
								onChange={(event) =>
									onUpdateForm((current) => ({
										...current,
										endDate: event.target.value,
									}))
								}
							/>
						</Field>
					</DateGrid>

					<CheckboxLabel>
						<Checkbox
							checked={form.isActive}
							type="checkbox"
							onChange={(event) =>
								onUpdateForm((current) => ({
									...current,
									isActive: event.target.checked,
								}))
							}
						/>
						Активный вызов
					</CheckboxLabel>

					<ModalActions>
						{mode === "edit" ? (
							<DangerButton
								disabled={!selectedChallenge || isMutating}
								type="button"
								onClick={onDelete}
							>
								Удалить
							</DangerButton>
						) : null}
						<SecondaryButton type="button" onClick={onClose}>
							Отмена
						</SecondaryButton>
						<Button disabled={isMutating} buttonType="containedInverted" type="submit">
							{mode === "edit" ? "Сохранить" : "Создать"}
						</Button>
					</ModalActions>
				</Form>
			</ModalDialog>
		</ModalOverlay>
	);
};

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding: clamp(2.5rem, 5vw, 4rem) 0 5rem;
`;

const Content = styled.section`
	width: min(calc(100% - (${theme.layout.contentGutter} * 2)), 78rem);
	margin: 0 auto;
`;

const Hero = styled.header`
	margin-bottom: 1.5rem;
`;

const HeroTop = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
`;

const BackLink = styled(Link)`
	color: ${theme.colors.orangeDark};
	font-size: 0.9rem;
	font-weight: 700;
	text-decoration: none;
`;

const NewButton = styled.button`
	border: 0.0625rem solid rgb(218 142 91 / 0.45);
	border-radius: 999px;
	background: rgb(218 142 91 / 0.1);
	padding: 0.7rem 1.1rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-weight: 700;
`;

const Title = styled.h1`
	margin: 0.45rem 0 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(2.8rem, 6vw, 5rem);
	line-height: 0.95;
`;

const Lead = styled.p`
	max-width: 48rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.05rem;
	line-height: 1.55;
`;

const StateMessage = styled.p`
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.5;
`;

const CarouselStage = styled.section`
	display: grid;
	grid-template-columns: 3rem minmax(0, 1fr) 3rem;
	align-items: center;
	gap: 1rem;
	width: min(100%, 58rem);
	margin: 0 auto;

	@media (max-width: 48rem) {
		grid-template-columns: 1fr;
	}
`;

const ArrowButton = styled.button`
	width: 3rem;
	height: 3rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 50%;
	background: rgb(255 255 255 / 0.58);
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 2rem;
	line-height: 1;

	@media (max-width: 48rem) {
		display: none;
	}
`;

const SpotlightCard = styled.article`
	display: grid;
	grid-template-columns: minmax(8rem, 0.7fr) minmax(12rem, 1fr) minmax(8rem, 0.7fr);
	align-items: center;
	gap: clamp(1rem, 3vw, 2rem);
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 1.4rem;
	background: rgb(255 255 255 / 0.58);
	padding: clamp(1rem, 3vw, 2rem);
	box-shadow: 0 1.5rem 4rem rgb(4 18 26 / 0.08);

	@media (max-width: 42rem) {
		grid-template-columns: 1fr;
		text-align: center;
	}
`;

const RingColumn = styled.div`
	display: flex;
	justify-content: center;
`;

const SpotlightCenter = styled.div`
	display: grid;
	justify-items: center;
	text-align: center;
`;

const SpotlightEyebrow = styled.span`
	color: ${theme.colors.orangeDark};
	font-size: 0.78rem;
	font-weight: 700;
	text-transform: uppercase;
`;

const SpotlightTitle = styled.strong`
	margin-top: 0.35rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: clamp(3rem, 7vw, 5.8rem);
	line-height: 0.9;
`;

const SpotlightSubtitle = styled.span`
	margin-top: 0.25rem;
	color: ${theme.colors.foreground};
	font-size: 1.05rem;
	font-weight: 700;
`;

const DateRange = styled.span`
	margin-top: 0.75rem;
	color: ${theme.colors.softForeground};
	font-size: 0.9rem;
`;

const ActiveBadge = styled.span`
	margin-top: 0.85rem;
	border-radius: 999px;
	background: rgb(35 61 77 / 0.1);
	padding: 0.3rem 0.7rem;
	color: ${theme.colors.bluePrimary};
	font-size: 0.78rem;
	font-weight: 700;
`;

const RingBox = styled.div`
	position: relative;
	display: grid;
	justify-items: center;
	color: ${theme.colors.foreground};
`;

const RingSvg = styled.svg`
	transform: rotate(-90deg);
`;

const RingValue = styled.strong`
	position: absolute;
	top: 2.95rem;
	font-family: ${theme.fonts.serif};
	font-size: 1.45rem;
	line-height: 1;
`;

const RingLabel = styled.span`
	position: absolute;
	top: 4.45rem;
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	text-transform: uppercase;
`;

const RingFootnote = styled.span`
	margin-top: 0.15rem;
	color: ${theme.colors.softForeground};
	font-size: 0.83rem;
	text-align: center;
`;

const CarouselDots = styled.div`
	display: flex;
	justify-content: center;
	gap: 0.45rem;
	margin-top: 1rem;
`;

const DotButton = styled.button<{ $isActive: boolean }>`
	width: ${({ $isActive }) => ($isActive ? "1.7rem" : "0.55rem")};
	height: 0.55rem;
	border: 0;
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeLight : "rgb(35 61 77 / 0.18)"};
	cursor: pointer;
	transition:
		width 180ms ease,
		background 180ms ease;
`;

const ActionsRow = styled.div`
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 0.7rem;
	margin-top: 1rem;
`;

const ActionButton = styled.button`
	border: 0.0625rem solid rgb(218 142 91 / 0.32);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.58);
	padding: 0.62rem 1rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-weight: 700;

	&:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
`;

const DetailsPanel = styled.section`
	width: min(100%, 42rem);
	margin: 1.2rem auto 0;
`;

const DetailsGrid = styled.div`
	display: grid;
	gap: 0.85rem;
	grid-template-columns: repeat(4, minmax(0, 1fr));

	@media (max-width: 42rem) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
`;

const Metric = styled.div`
	border: 0.0625rem solid rgb(211 202 196 / 0.58);
	border-radius: 0.85rem;
	background: rgb(242 239 237 / 0.72);
	padding: 0.85rem;
	text-align: center;
`;

const MetricValue = styled.strong`
	display: block;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.6rem;
	line-height: 1;
`;

const MetricLabel = styled.span`
	display: block;
	margin-top: 0.35rem;
	color: ${theme.colors.softForeground};
	font-size: 0.82rem;
	line-height: 1.25;
`;

const PanelText = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;

const EmptyState = styled.section`
	width: min(100%, 34rem);
	margin: 2rem auto 0;
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 1.2rem;
	background: rgb(255 255 255 / 0.58);
	padding: 2rem;
	text-align: center;
`;

const EmptyTitle = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.8rem;
`;

const EmptyText = styled.p`
	margin: 0.75rem 0 1.25rem;
	color: ${theme.colors.softForeground};
	line-height: 1.5;
`;

const ModalOverlay = styled.div`
	position: fixed;
	z-index: 60;
	inset: 0;
	display: grid;
	place-items: center;
	overflow-y: auto;
	background: rgb(4 18 26 / 0.48);
	padding: 1rem;
`;

const ModalDialog = styled.section`
	width: min(100%, 36rem);
	border: 0.0625rem solid #eeb38d;
	border-radius: 1.1rem;
	background: #e8e2de;
	padding: 1.35rem;
	box-shadow: 0 1.25rem 3rem rgb(4 18 26 / 0.16);
`;

const ModalHeader = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
	margin: 0;
	color: #04121a;
	font-family: ${theme.fonts.serif};
	font-size: 1.6rem;
	font-weight: 600;
	line-height: 1.2;
`;

const CloseButton = styled.button`
	border: 0;
	background: transparent;
	color: ${theme.colors.softForeground};
	cursor: pointer;
	font: inherit;
	font-size: 1.6rem;
	line-height: 1;
`;

const Form = styled.form`
	display: grid;
	gap: 1rem;
`;

const Fieldset = styled.div`
	display: grid;
	gap: 0.5rem;
`;

const FieldsetLabel = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.82rem;
	font-weight: 700;
`;

const Segmented = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
`;

const SegmentButton = styled.button<{ $isActive: boolean }>`
	border: 0.0625rem solid
		${({ $isActive }) => ($isActive ? "#da8e5b" : "rgb(211 202 196 / 0.82)")};
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.16)" : "rgb(242 239 237 / 0.72)"};
	padding: 0.58rem 0.95rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeDark : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-weight: 600;
`;

const TargetBox = styled.div`
	display: grid;
	gap: 0.65rem;
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.72);
	padding: 1rem;
`;

const TargetTop = styled.div`
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 1rem;
`;

const TargetValue = styled.strong`
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.5rem;
	line-height: 1;
`;

const Range = styled.input`
	width: 100%;
	accent-color: ${theme.colors.orangeLight};
`;

const DateGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;

	@media (max-width: 34rem) {
		grid-template-columns: 1fr;
	}
`;

const Field = styled.label`
	display: grid;
	gap: 0.3rem;
`;

const Label = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	font-weight: 700;
`;

const fieldStyles = `
	min-height: 2.35rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 0.75rem;
	background: rgb(242 239 237 / 0.72);
	padding: 0 0.75rem;
	color: ${theme.colors.foreground};
	font: inherit;
`;

const Input = styled.input`
	${fieldStyles}
`;

const CheckboxLabel = styled.label`
	display: inline-flex;
	align-items: center;
	gap: 0.55rem;
	color: ${theme.colors.foreground};
	font-size: 0.9rem;
`;

const Checkbox = styled.input`
	width: 1rem;
	height: 1rem;
	accent-color: ${theme.colors.orangeLight};
`;

const ModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 0.65rem;
	margin-top: 0.25rem;
`;

const SecondaryButton = styled.button`
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.58);
	padding: 0.58rem 0.95rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-weight: 700;
`;

const DangerButton = styled(SecondaryButton)`
	margin-right: auto;
	border-color: rgb(160 52 52 / 0.32);
	color: #a03434;

	&:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
`;
