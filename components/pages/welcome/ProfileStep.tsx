import { InputField } from "@/shared/ui/InputField";

import {
	FieldGroup,
	FieldLabel,
	StepBody,
	StepDescription,
	StepTitle,
} from "./stepStyles";

interface ProfileStepProps {
	name: string;
	username: string;
	onNameChange: (value: string) => void;
	onUsernameChange: (value: string) => void;
}

export const ProfileStep = ({
	name,
	username,
	onNameChange,
	onUsernameChange,
}: ProfileStepProps) => (
	<StepBody>
		<StepTitle>Как к тебе обращаться?</StepTitle>
		<StepDescription>
			Твоё имя и username — твоя визитка в Litreasure.
		</StepDescription>
		<FieldGroup>
			<FieldLabel htmlFor="welcome-name">Имя</FieldLabel>
			<InputField
				id="welcome-name"
				autoComplete="name"
				required
				value={name}
				onChange={(e) => onNameChange(e.target.value)}
			/>
		</FieldGroup>
		<FieldGroup>
			<FieldLabel htmlFor="welcome-username">Username</FieldLabel>
			<InputField
				id="welcome-username"
				autoComplete="username"
				minLength={3}
				required
				value={username}
				onChange={(e) => onUsernameChange(e.target.value)}
			/>
		</FieldGroup>
	</StepBody>
);
