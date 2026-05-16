"use client";

import { AvatarStep } from "./AvatarStep";
import { GenresStep } from "./GenresStep";
import { GoalStep } from "./GoalStep";
import { ProfileStep } from "./ProfileStep";
import type { IWelcomeStep } from "./types";

interface IWelcomeStepContentProps {
	activeStep: IWelcomeStep;
	name: string;
	username: string;
	hasUsernameError: boolean;
	avatarUrl: string;
	selectedGenres: string[];
	yearGoal: number;
	onNameChange: (value: string) => void;
	onUsernameChange: (value: string) => void;
	onAvatarChange: (url: string) => void;
	onGenreToggle: (slug: string) => void;
	onGoalChange: (value: number) => void;
}

export const WelcomeStepContent = ({
	activeStep,
	name,
	username,
	hasUsernameError,
	avatarUrl,
	selectedGenres,
	yearGoal,
	onNameChange,
	onUsernameChange,
	onAvatarChange,
	onGenreToggle,
	onGoalChange,
}: IWelcomeStepContentProps) => {
	if (activeStep === "profile") {
		return (
			<ProfileStep
				name={name}
				username={username}
				hasUsernameError={hasUsernameError}
				onNameChange={onNameChange}
				onUsernameChange={onUsernameChange}
			/>
		);
	}

	if (activeStep === "avatar") {
		return <AvatarStep avatarUrl={avatarUrl} onAvatarChange={onAvatarChange} />;
	}

	if (activeStep === "genres") {
		return (
			<GenresStep selectedGenres={selectedGenres} onToggle={onGenreToggle} />
		);
	}

	return <GoalStep yearGoal={yearGoal} onGoalChange={onGoalChange} />;
};
