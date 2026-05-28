import { useState } from "react";
import styled from "styled-components";

import { useAverageChallengeQuery } from "@/shared/api/book-challenge";
import { theme } from "@/shared/theme";

import { StepBody, StepDescription, StepTitle } from "./stepStyles";
import { GOAL_PRESETS, type IGoalStartMode } from "./types";

interface IGoalStepProps {
	goalStartMode: IGoalStartMode;
	yearGoal: number;
	onGoalChange: (value: number) => void;
	onGoalStartModeChange: (value: IGoalStartMode) => void;
}

const clampGoal = (value: number) => Math.min(999, Math.max(1, value));

export const GoalStep = ({
	goalStartMode,
	yearGoal,
	onGoalChange,
	onGoalStartModeChange,
}: IGoalStepProps) => {
	const [draftGoal, setDraftGoal] = useState(yearGoal ? String(yearGoal) : "");
	const {
		data: averageChallenge,
		isError: isAverageError,
		isLoading: isAverageLoading,
	} = useAverageChallengeQuery("year", yearGoal);
	const hasGoal = draftGoal.length > 0 && yearGoal > 0;
	const averageTarget = averageChallenge?.averageTargetValue ?? 0;
	const roundedAverageTarget = Math.round(averageTarget);
	const goalDifference = yearGoal - averageTarget;
	const formattedDifference = Math.abs(goalDifference).toFixed(
		Math.abs(goalDifference) >= 10 ? 0 : 1,
	);

	const commitDraftGoal = () => {
		if (!draftGoal) {
			onGoalChange(0);
			return;
		}

		const nextGoal = Number(draftGoal);
		const normalizedGoal = Number.isFinite(nextGoal) ? clampGoal(nextGoal) : 1;
		onGoalChange(normalizedGoal);
		setDraftGoal(String(normalizedGoal));
	};

	const handleDraftChange = (value: string) => {
		const digitsOnly = value.replace(/\D/g, "");
		setDraftGoal(digitsOnly);

		if (digitsOnly) {
			onGoalChange(clampGoal(Number(digitsOnly)));
		} else {
			onGoalChange(0);
		}
	};

	const selectPreset = (preset: number) => {
		setDraftGoal(String(preset));
		onGoalChange(preset);
	};

	return (
		<GoalStepBody>
			<StepTitle>Цель на год</StepTitle>
			<StepDescription>
				Читательская цель поддерживает мотивацию. Сколько книг ты хочешь
				прочитать в этом году?
			</StepDescription>
			<GoalLayout>
				<GoalLeft>
					<GoalStartField>
						<GoalStartLabel>Начать вызов</GoalStartLabel>
						<GoalStartOptions>
							<GoalStartOption
								type="button"
								$isActive={goalStartMode === "yearStart"}
								onClick={() => onGoalStartModeChange("yearStart")}
							>
								С начала года
							</GoalStartOption>
							<GoalStartOption
								type="button"
								$isActive={goalStartMode === "today"}
								onClick={() => onGoalStartModeChange("today")}
							>
								С текущей даты
							</GoalStartOption>
						</GoalStartOptions>
					</GoalStartField>
					<GoalInputRow>
						<GoalInputColumn>
							<GoalInputLabel>Введи количество книг на год</GoalInputLabel>
							<GoalCounter>
								<GoalNumberInput
									aria-label="Количество книг на год"
									inputMode="numeric"
									$isEmpty={!draftGoal}
									placeholder="24"
									value={draftGoal}
									onBlur={commitDraftGoal}
									onChange={(event) => handleDraftChange(event.target.value)}
								/>
							</GoalCounter>
							{/* <GoalInputHelp>
								Это число станет целью книжного вызова.
							</GoalInputHelp> */}
						</GoalInputColumn>
						<AverageComparison>
							<AverageLabel>Средняя цель читателей</AverageLabel>
							{isAverageLoading ? (
								<AverageText>Сверяем с другими целями...</AverageText>
							) : isAverageError || !averageChallenge ? (
								<AverageText>
									Пока не удалось загрузить среднее значение.
								</AverageText>
							) : (
								<>
									<AverageValue>{roundedAverageTarget} книг в год</AverageValue>
								</>
							)}
						</AverageComparison>
					</GoalInputRow>
					<GoalPresetsRow>
						{GOAL_PRESETS.map((preset) => (
							<GoalPreset
								key={preset}
								type="button"
								$isActive={yearGoal === preset}
								onClick={() => selectPreset(preset)}
							>
								{preset}
							</GoalPreset>
						))}
					</GoalPresetsRow>
					<GoalHint>
						{!hasGoal
							? "Например, две книги в месяц — хорошая привычка"
							: yearGoal <= 12
								? "Отличное начало — одна книга в месяц"
								: yearGoal <= 24
									? "Две книги в месяц — хорошая привычка"
									: yearGoal <= 52
										? "Почти по книге в неделю — настоящий читатель"
										: "Легендарный темп! Ты точно готов?"}
					</GoalHint>
				</GoalLeft>
			</GoalLayout>
		</GoalStepBody>
	);
};

const GoalStepBody = styled(StepBody)`
	gap: 1.15rem;
`;

const GoalLayout = styled.div`
	display: flex;
	flex: 1;
	align-items: center;
	gap: 2rem;
	margin-top: 0.35rem;
	min-height: 0;
`;

const GoalLeft = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	gap: 1.15rem;
`;

const GoalCounter = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const GoalInputRow = styled.div`
	display: grid;
	width: min(100%, 35rem);
	grid-template-columns: minmax(8.5rem, 0.8fr) minmax(13rem, 1fr);
	align-items: center;
	gap: 1rem;

	@media (max-width: 38rem) {
		grid-template-columns: 1fr;
	}
`;

const GoalInputColumn = styled.div`
	display: grid;
	justify-items: center;
	gap: 0.45rem;
`;

const GoalInputLabel = styled.span`
	color: ${theme.colors.foreground};
	font-size: 0.86rem;
	font-weight: 700;
	text-align: center;
`;

const GoalInputHelp = styled.p`
	max-width: 12.5rem;
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	line-height: 1.35;
	text-align: center;
`;

const GoalNumberInput = styled.input<{ $isEmpty: boolean }>`
	width: 5.25rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.18);
	border-radius: 0.75rem;
	background: ${({ $isEmpty }) =>
		$isEmpty ? "rgb(218 142 91 / 0.08)" : "transparent"};
	padding: 0.25rem 0.35rem;
	color: #04121a;
	font-family: ${theme.fonts.serif};
	font-size: 4rem;
	font-weight: 600;
	line-height: 1;
	text-align: center;
	outline: none;
	box-shadow: ${({ $isEmpty }) =>
		$isEmpty ? "0 0 0 0.125rem rgb(218 142 91 / 0.18)" : "none"};
	transition:
		background-color 150ms,
		box-shadow 150ms;

	&:hover,
	&:focus {
		border-color: rgb(218 142 91 / 0.28);
		background: rgb(218 142 91 / 0.08);
		box-shadow: 0 0 0 0.125rem rgb(218 142 91 / 0.18);
	}

	&::placeholder {
		color: rgb(4 18 26 / 0.26);
	}
`;

const GoalStartField = styled.div`
	display: grid;
	justify-items: center;
	gap: 0.55rem;
`;

const GoalStartLabel = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	font-weight: 700;
`;

const GoalStartOptions = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.55rem;
`;

const GoalStartOption = styled.button<{ $isActive: boolean }>`
	border: 0.0625rem solid
		${({ $isActive }) => ($isActive ? "#da8e5b" : "rgb(186 183 180 / 0.52)")};
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.12)" : "transparent"};
	padding: 0.38rem 0.85rem;
	color: ${({ $isActive }) =>
		$isActive ? "#da8e5b" : theme.colors.softForeground};
	cursor: pointer;
	font: inherit;
	font-size: 0.82rem;
	font-weight: 700;
	transition:
		background 150ms,
		border-color 150ms,
		color 150ms;

	&:hover,
	&:focus-visible {
		border-color: #da8e5b;
		color: #da8e5b;
		outline: none;
	}
`;

const GoalPresetsRow = styled.div`
	display: flex;
	gap: 0.65rem;
`;

const GoalPreset = styled.button<{ $isActive: boolean }>`
	border: 0.0625rem solid
		${({ $isActive }) => ($isActive ? "#da8e5b" : "rgb(186 183 180 / 0.6)")};
	border-radius: 999px;
	background: ${({ $isActive }) =>
		$isActive ? "rgb(218 142 91 / 0.12)" : "transparent"};
	padding: 0.3rem 0.85rem;
	color: ${({ $isActive }) => ($isActive ? "#da8e5b" : "#bab7b4")};
	font: inherit;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition:
		background 150ms,
		border-color 150ms,
		color 150ms;

	&:hover {
		border-color: #da8e5b;
		color: #da8e5b;
	}
`;

const GoalHint = styled.p`
	margin: 0.1rem 0 0.85rem;
	color: ${theme.colors.softForeground};
	font-size: 0.875rem;
	font-style: italic;
	line-height: 1.4;
`;

const AverageComparison = styled.div`
	display: grid;
	width: 100%;
	gap: 0.35rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.24);
	border-radius: 0.75rem;
	background: rgb(242 239 237 / 0.48);
	padding: 0.85rem 1rem;
`;

const AverageLabel = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	font-weight: 700;
	line-height: 1.2;
`;

const AverageValue = styled.strong`
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 0.8rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1.15;
`;

const AverageText = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.86rem;
	line-height: 1.4;
`;
