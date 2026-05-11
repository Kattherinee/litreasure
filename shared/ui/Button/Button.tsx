import MuiButton, {
	type ButtonProps as MuiButtonProps,
} from "@mui/material/Button";
import styled, { css } from "styled-components";

import { theme } from "@/shared/theme";

type ButtonStyle = "default" | "oxygenPill";
type ButtonVariant = "contained" | "outlined" | "text" | "containedInverted";

export type ButtonProps = Omit<
	MuiButtonProps,
	"disableElevation" | "variant"
> & {
	buttonStyle?: ButtonStyle;
	variant?: ButtonVariant;
};

const Button = ({
	buttonStyle = "default",
	variant = "contained",
	...props
}: ButtonProps) => {
	const muiVariant = variant === "containedInverted" ? "contained" : variant;

	return (
		<StyledButton
			$buttonStyle={buttonStyle}
			$variant={variant}
			disableElevation
			variant={muiVariant}
			{...props}
		/>
	);
};

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

const containedInvertedStyles = css`
	background: ${theme.colors.orangeLight};
	border-color: ${theme.colors.orangeLight};
	color: ${theme.colors.invertedText};

	&:hover {
		background: ${theme.colors.invertedText};
		border-color: ${theme.colors.invertedText};
		color: ${theme.colors.foreground};
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
	$variant: ButtonVariant;
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

		${({ $variant }) => {
			if ($variant === "outlined") {
				return outlinedStyles;
			}

			if ($variant === "text") {
				return textStyles;
			}
			if ($variant === "containedInverted") {
				return containedInvertedStyles;
			}

			return containedStyles;
		}}

		${({ $buttonStyle }) =>
			$buttonStyle === "oxygenPill" ? oxygenPillStyles : null}
	}
`;
