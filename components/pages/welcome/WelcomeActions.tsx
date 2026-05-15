"use client";

import styled from "styled-components";

import { Button } from "@/shared/ui/Button";

interface WelcomeActionsProps {
	canGoBack: boolean;
	isFinalStep: boolean;
	isNextDisabled: boolean;
	isSubmitting: boolean;
	isCheckingUsername: boolean;
	isSavingProfile: boolean;
	onBack: () => void;
	onFinish: () => void;
	onNext: () => void;
}

export const WelcomeActions = ({
	canGoBack,
	isFinalStep,
	isNextDisabled,
	isSubmitting,
	isCheckingUsername,
	isSavingProfile,
	onBack,
	onFinish,
	onNext,
}: WelcomeActionsProps) => (
	<Actions $hasBackButton={canGoBack}>
		{canGoBack ? (
			<SecondaryButton type="button" variant="outlined" onClick={onBack}>
				Назад
			</SecondaryButton>
		) : null}
		<RightActions>
			{isFinalStep ? (
				<PrimaryButton
					disabled={isSubmitting}
					type="button"
					variant="containedInverted"
					onClick={onFinish}
				>
					Завершить
				</PrimaryButton>
			) : (
				<PrimaryButton
					disabled={isNextDisabled}
					type="button"
					variant="containedInverted"
					onClick={onNext}
				>
					{isCheckingUsername
						? "Проверяем..."
						: isSavingProfile
							? "Сохраняем..."
							: "Дальше"}
				</PrimaryButton>
			)}
		</RightActions>
	</Actions>
);

const Actions = styled.div<{ $hasBackButton: boolean }>`
	display: flex;
	align-items: center;
	justify-content: ${({ $hasBackButton }) =>
		$hasBackButton ? "space-between" : "flex-end"};
	gap: 0.75rem;
	padding-top: 0.5rem;

	@media (max-width: 30rem) {
		flex-direction: column-reverse;
	}
`;

const RightActions = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
`;

const PrimaryButton = styled(Button)``;

const SecondaryButton = styled(Button)``;
