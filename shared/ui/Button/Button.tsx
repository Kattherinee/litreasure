import MuiButton, {
	type ButtonProps as MuiButtonProps,
} from "@mui/material/Button";
import styled, { css } from "styled-components";

import { theme } from "@/shared/theme";

export type ButtonProps = Omit<MuiButtonProps, "disableElevation">;

const Button = ({ variant = "contained", ...props }: ButtonProps) => (
	<StyledButton disableElevation variant={variant} {...props} />
);

export default Button;

const containedStyles = css`
	background: ${theme.colors.background};
	border-color: ${theme.colors.background};
	color: ${theme.colors.foreground};

	&:hover {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.lightText};
	}
`;

const outlinedStyles = css`
	background: transparent;
	border-color: ${theme.colors.lightText};
	color: ${theme.colors.lightText};

	&:hover {
		background: ${theme.colors.orangeLight};
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.lightText};
	}
`;

const textStyles = css`
	background: transparent;
	border-color: transparent;
	color: ${theme.colors.lightText};

	&:hover {
		background: transparent;
		border-color: transparent;
		color: ${theme.colors.orangeLight};
	}
`;

const StyledButton = styled(MuiButton)<ButtonProps>`
	border: 1px solid transparent;
	border-radius: 50px;

	font-family: var(--font-serif);
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
		background: transparent;
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
`;
