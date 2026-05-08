import type { InputHTMLAttributes } from "react";
import styled from "styled-components";

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
	border: 1px solid transparent;
	border-radius: 20px;
	background: #c9c4c0;
	padding: 6px 14px;
	color: #4f5152;
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
		border-color: #b8b1ad;
		background: #f2efed;
		color: #4f5152;
	}

	&:focus,
	&:focus-visible {
		border-color: var(--orange-primary);
		background: #f2efed;
		box-shadow: 0 0 8px rgb(254 127 45 / 0.34);
		color: var(--foreground);
	}

	&:disabled {
		border-color: #9f9f9f;
		background: transparent;
		box-shadow: none;
		color: #8e8e8e;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		min-height: 48px;
		border-radius: 18px;
		font-size: 20px;
	}
`;
