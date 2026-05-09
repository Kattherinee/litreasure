import type { InputHTMLAttributes } from "react";
import styled from "styled-components";

import { theme } from "@/shared/theme";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	disabled?: boolean;
	"aria-label"?: string;
}

const InputField = ({
	disabled = false,
	placeholder = "Поле ввода",
	...props
}: InputFieldProps) => (
	<StyledInput {...props} disabled={disabled} placeholder={placeholder} />
);

export default InputField;

const StyledInput = styled.input`
	width: 100%;
	min-height: 38px;
	border: 1px solid ${theme.colors.transparent};
	border-radius: 20px;
	background: ${theme.colors.inputBackground};
	padding: 6px 14px;
	color: ${theme.colors.softForeground};
	font: inherit;
	font-size: 16px;
	line-height: 1.12;
	outline: none;
	transition:
		background-color 180ms ease,
		border-color 180ms ease,
		box-shadow 180ms ease,
		color 180ms ease;

	&::placeholder {
		color: currentColor;
		opacity: 1;
	}

	&:hover:not(:disabled) {
		border-color: ${theme.colors.inputHoverBorder};
		background: ${theme.colors.surface};
		color: ${theme.colors.softForeground};
	}

	&:focus,
	&:focus-visible {
		border-color: ${theme.colors.orangePrimary};
		background: ${theme.colors.surface};
		box-shadow: 0 0 8px ${theme.alpha.orangeFocus};
		color: ${theme.colors.foreground};
	}

	&:disabled {
		border-color: ${theme.colors.inputDisabledBorder};
		background: ${theme.colors.transparent};
		box-shadow: none;
		color: ${theme.colors.inputDisabledText};
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		min-height: 48px;
		border-radius: 18px;
		font-size: 20px;
	}
`;
