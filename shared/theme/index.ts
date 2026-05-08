export const theme = {
	colors: {
		background: "#e8e2de",
		surface: "#f2efed",
		foreground: "#04121a",
		orangePrimary: "#fe7f2d",
		orangeDark: "#d4641c",
		orangeLight: "#eda06c",
		bluePrimary: "#233d4d",
		lightText: "#f2efed",
		muted: "#bab7b4",
		greyWarm: "#bab7b4",
		border: "#d3cac4",
		softForeground: "#4f5152",
	},
	rubberSize: {
		desktop: "1199px",
		tablet: "767px",
		phone: "375px",
	},
} as const;

type RubberScreen = keyof typeof theme.rubberSize;

const getScreenWidth = (screen: RubberScreen) =>
	Number.parseFloat(theme.rubberSize[screen]);

export const pxToVw = (size: number, screen: RubberScreen = "desktop") =>
	`${(size / getScreenWidth(screen)) * 100}vw`;
