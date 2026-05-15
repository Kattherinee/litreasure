import styled from "styled-components";

import { theme } from "@/shared/theme";

import { StepBody, StepDescription, StepTitle } from "./stepStyles";
import { GOAL_PRESETS } from "./types";

interface GoalStepProps {
	yearGoal: number;
	onGoalChange: (value: number) => void;
}

export const GoalStep = ({ yearGoal, onGoalChange }: GoalStepProps) => (
	<StepBody>
		<StepTitle>Цель на год</StepTitle>
		<StepDescription>
			Читательская цель поддерживает мотивацию. Сколько книг ты хочешь прочитать
			в этом году?
		</StepDescription>
		<GoalLayout>
			<GoalLeft>
				<GoalSubLabel>Сколько книг прочитать?</GoalSubLabel>
				<GoalCounter>
					<GoalBtn
						type="button"
						onClick={() => onGoalChange(Math.max(1, yearGoal - 1))}
					>
						−
					</GoalBtn>
					<GoalNumber>{yearGoal}</GoalNumber>
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
			<GoalImg
				alt=""
				src={
					yearGoal >= 52
						? "/images/welcomePage/dracoFire.png"
						: yearGoal >= 24
							? "/images/welcomePage/dracoSword2.png"
							: yearGoal >= 12
								? "/images/welcomePage/dracobook2.png"
								: "/images/welcomePage/dracoWitch1.png"
				}
			/>
		</GoalLayout>
	</StepBody>
);

/* ── Styles ──────────────────────────────────────────────── */

const GoalLayout = styled.div`
	display: flex;
	flex: 1;
	align-items: center;
	gap: 2rem;
	min-height: 0;
`;

const GoalLeft = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 1.25rem;
`;

const GoalSubLabel = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.9rem;
`;

const GoalCounter = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
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

const GoalNumber = styled.span`
	min-width: 3.5rem;
	color: #04121a;
	font-family: ${theme.fonts.serif};
	font-size: 4rem;
	font-weight: 600;
	line-height: 1;
	text-align: center;
`;

const GoalPresetsRow = styled.div`
	display: flex;
	gap: 0.5rem;
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
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.875rem;
	font-style: italic;
	line-height: 1.4;
`;

const GoalImg = styled.img`
	height: min(14rem, 40vh);
	width: auto;
	object-fit: contain;
	flex-shrink: 0;
`;
