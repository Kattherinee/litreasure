import { useEffect, useState } from "react";
import styled from "styled-components";

import { theme } from "@/shared/theme";

import { StepBody, StepDescription, StepTitle } from "./stepStyles";
import { GOAL_PRESETS } from "./types";

interface GoalStepProps {
	yearGoal: number;
	onGoalChange: (value: number) => void;
}

const clampGoal = (value: number) => Math.min(999, Math.max(1, value));

export const GoalStep = ({ yearGoal, onGoalChange }: GoalStepProps) => {
	const [draftGoal, setDraftGoal] = useState(String(yearGoal));

	useEffect(() => {
		setDraftGoal(String(yearGoal));
	}, [yearGoal]);

	const commitDraftGoal = () => {
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
		}
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
					<GoalCounter>
						<GoalBtn
							type="button"
							onClick={() => onGoalChange(Math.max(1, yearGoal - 1))}
						>
							−
						</GoalBtn>
						<GoalNumberInput
							aria-label="Количество книг на год"
							inputMode="numeric"
							value={draftGoal}
							onBlur={commitDraftGoal}
							onChange={(event) => handleDraftChange(event.target.value)}
						/>
						<GoalBtn
							type="button"
							onClick={() => onGoalChange(Math.min(999, yearGoal + 1))}
						>
							+
						</GoalBtn>
					</GoalCounter>
					<GoalPresetsRow>
						{GOAL_PRESETS.map((preset) => (
							<GoalPreset
								key={preset}
								type="button"
								$isActive={yearGoal === preset}
								onClick={() => onGoalChange(preset)}
							>
								{preset}
							</GoalPreset>
						))}
					</GoalPresetsRow>
					<GoalHint>
						{yearGoal <= 12
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
	gap: 1.5rem;
`;

const GoalCounter = styled.div`
	display: flex;
	align-items: center;
	gap: 1.15rem;
`;

const GoalBtn = styled.button`
	display: grid;
	width: 2.5rem;
	height: 2.5rem;
	place-items: center;
	border: 0.0625rem solid rgb(218 142 91 / 0.5);
	border-radius: 50%;
	background: transparent;
	color: #da8e5b;
	font-size: 1.5rem;
	font-weight: 300;
	line-height: 1;
	cursor: pointer;
	transition:
		background 150ms,
		border-color 150ms;

	&:hover {
		background: rgb(218 142 91 / 0.12);
		border-color: #da8e5b;
	}
`;

const GoalNumberInput = styled.input`
	width: 5.25rem;
	border: 0;
	border-radius: 0.75rem;
	background: transparent;
	padding: 0;
	color: #04121a;
	font-family: ${theme.fonts.serif};
	font-size: 4rem;
	font-weight: 600;
	line-height: 1;
	text-align: center;
	outline: none;
	transition:
		background-color 150ms,
		box-shadow 150ms;

	&:hover,
	&:focus {
		background: rgb(218 142 91 / 0.08);
		box-shadow: 0 0 0 0.125rem rgb(218 142 91 / 0.18);
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
