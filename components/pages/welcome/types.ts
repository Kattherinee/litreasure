export type IWelcomeStep = "profile" | "avatar" | "genres" | "goal";

export interface IStepConfig {
	id: IWelcomeStep;
	label: string;
	skippable?: boolean;
}

export const STEPS: IStepConfig[] = [
	{ id: "profile", label: "Профиль" },
	{ id: "avatar", label: "Аватар" },
	{ id: "genres", label: "Жанры", skippable: true },
	{ id: "goal", label: "Цель", skippable: true },
];

export const MIN_SELECTED_GENRES = 5;
export const GOAL_PRESETS = [12, 24, 36, 52];
export const ONBOARDING_STORAGE_KEY = "litreasure-onboarding-draft";

export const STEP_IMAGES: Record<IWelcomeStep, string> = {
	profile: "/images/welcomePage/dracobook2.png",
	avatar: "/images/welcomePage/dracoFire.png",
	genres: "/images/welcomePage/dracoWitch1.png",
	goal: "/images/welcomePage/dracoSword2.png",
};

export const STEP_SUBTITLES: Record<IWelcomeStep, string> = {
	profile: "Каждая история начинается с имени",
	avatar: "",
	genres:
		"Выбери минимум 5 жанров, которые тебе нравятся. Сначала открой одну или несколько групп, затем отметь жанры внутри.",
	goal: "Читай больше. Живи глубже.",
};
