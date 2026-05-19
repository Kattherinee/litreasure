"use client";

import { createGlobalStyle } from "styled-components";

import { theme } from "@/shared/theme";

const GlobalStyle = createGlobalStyle`
	* {
		box-sizing: border-box;
	}

	html {
		min-height: 100%;
		overflow-x: clip;
		overscroll-behavior-x: none;
		background: ${theme.colors.background};
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	body {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		margin: 0;
		overflow-x: clip;
		overscroll-behavior-x: none;
			background: ${theme.colors.background};
		color: ${theme.colors.foreground};
		font-family: ${theme.fonts.sans};
		text-rendering: optimizeLegibility;
	}

	h1,
	h2,
	h3,
	[data-display="serif"] {
		font-family: ${theme.fonts.serif};
	}
`;

export default GlobalStyle;
