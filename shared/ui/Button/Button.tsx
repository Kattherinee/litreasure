import MuiButton, {
	type ButtonProps as MuiButtonProps,
} from "@mui/material/Button";
import styled, { css } from "styled-components";

import { theme } from "@/shared/theme";

type ButtonStyle = "default" | "oxygenPill";

export type ButtonProps = Omit<MuiButtonProps, "disableElevation"> & {
	buttonStyle?: ButtonStyle;
};

const Button = ({
	buttonStyle = "default",
	variant = "contained",
	...props
}: ButtonProps) => (
	<StyledButton
		$buttonStyle={buttonStyle}
		disableElevation
		variant={variant}
		{...props}
	/>
);

export default Button;

const containedStyles = css`
	background: ${theme.colors.invertedText};
	border-color: ${theme.colors.invertedText};
	color: ${theme.colors.foreground};

	&:hover {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
	}
`;

const outlinedStyles = css`
	background: ${theme.colors.transparent};
	border-color: ${theme.colors.lightText};
	color: ${theme.colors.lightText};

	&:hover {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.lightText};
	}
`;

const textStyles = css`
	background: ${theme.colors.transparent};
	border-color: ${theme.colors.transparent};
	color: ${theme.colors.invertedText};

	&:hover {
		background: ${theme.colors.transparent};
		border-color: ${theme.colors.transparent};
		color: ${theme.colors.orangeLight};
	}
`;

const oxygenPillStyles = css`
	min-width: 0;
	background: ${theme.colors.invertedText};
	border-color: ${theme.colors.invertedText};
	padding: 0.5rem 1rem;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.875rem;
	font-weight: 400;
	line-height: 1.25rem;

	&:hover {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
	}
`;

const StyledButton = styled(MuiButton)<{
	$buttonStyle: ButtonStyle;
	variant?: ButtonProps["variant"];
}>`
	&& {
		border: 1px solid ${theme.colors.transparent};
		border-radius: 50px;

		font-family: ${theme.fonts.serif};
		font-size: 16px;
		font-weight: 500;
		line-height: 20px;
		text-align: center;
		text-transform: none;
		transition:
			background-color 180ms ease,
			border-color 180ms ease,
			color 180ms ease;

		&.Mui-disabled {
			border-color: ${theme.colors.muted};
			background: ${theme.colors.transparent};
			color: ${theme.colors.muted};
		}

		${({ variant = "contained" }) => {
			if (variant === "outlined") {
				return outlinedStyles;
			}

			if (variant === "text") {
				return textStyles;
			}

			return containedStyles;
		}}

		${({ $buttonStyle }) =>
			$buttonStyle === "oxygenPill" ? oxygenPillStyles : null}
	}
`;
