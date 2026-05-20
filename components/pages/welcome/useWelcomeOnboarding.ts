"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createChallenge } from "@/shared/api/book-challenge";
import { checkUsernameAvailability } from "@/shared/api/auth";
import { updateUserGenres, updateUserProfile } from "@/shared/api/users";
import { useAuthStore } from "@/shared/store/auth-store";

import {
	canOpenWelcomeOnboarding,
	markWelcomeOnboardingCompleted,
} from "./onboardingStorage";
import { MIN_SELECTED_GENRES, STEPS, type IWelcomeStep } from "./types";

export const useWelcomeOnboarding = () => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);
	const setSession = useAuthStore((state) => state.setSession);

	const [canRenderWelcome, setCanRenderWelcome] = useState(false);
	const [activeStep, setActiveStep] = useState<IWelcomeStep>("profile");
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [yearGoal, setYearGoal] = useState(24);
	const [formError, setFormError] = useState("");
	const [hasUsernameError, setHasUsernameError] = useState(false);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const userId = session?.user?.id;
	const activeStepIndex = STEPS.findIndex((step) => step.id === activeStep);
	const activeStepConfig = STEPS[activeStepIndex];

	useEffect(() => {
		if (!session) {
			router.replace("/");
			return;
		}

		if (!canOpenWelcomeOnboarding(session.user)) {
			router.replace("/");
			return;
		}

		setCanRenderWelcome(true);
	}, [router, session]);

	const isNextDisabled =
		(activeStep === "profile" &&
			(!name.trim() || username.trim().length < 3)) ||
		(activeStep === "avatar" && !avatarUrl) ||
		(activeStep === "genres" && selectedGenres.length < MIN_SELECTED_GENRES) ||
		Boolean(formError) ||
		isCheckingUsername ||
		isSavingProfile;

	const clearError = () => {
		setFormError("");
		setHasUsernameError(false);
	};

	const changeName = (value: string) => {
		setName(value);
		setFormError("");
	};

	const changeUsername = (value: string) => {
		setUsername(value);
		clearError();
	};

	const changeAvatar = (url: string) => {
		setAvatarUrl(url);
		setFormError("");
	};

	const changeYearGoal = (value: number) => {
		setYearGoal(value);
		setFormError("");
	};

	const selectStep = (step: IWelcomeStep) => {
		setActiveStep(step);
		clearError();
	};

	const toggleGenre = (slug: string) => {
		setSelectedGenres((current) =>
			current.includes(slug)
				? current.filter((genre) => genre !== slug)
				: [...current, slug],
		);
	};

	const goNext = async () => {
		clearError();

		if (activeStep === "profile") {
			try {
				setIsCheckingUsername(true);
				const available = await checkUsernameAvailability(username.trim());
				if (!available) {
					setHasUsernameError(true);
					setFormError("Этот username уже занят. Попробуйте другой.");
					return;
				}
			} finally {
				setIsCheckingUsername(false);
			}

			if (!userId) {
				setFormError("Сессия не найдена. Попробуйте войти заново.");
				return;
			}

			try {
				setIsSavingProfile(true);
				await updateUserProfile(userId, {
					name: name.trim() || undefined,
					username: username.trim() || undefined,
				});
				if (session) {
					setSession({
						...session,
						user: {
							...session.user,
							name: name.trim() || undefined,
							username: username.trim() || undefined,
						},
					});
				}
				setActiveStep("avatar");
			} catch (error) {
				setHasUsernameError(true);
				setFormError(
					error instanceof Error
						? error.message
						: "Не удалось сохранить профиль. Попробуйте еще раз.",
				);
			} finally {
				setIsSavingProfile(false);
			}
			return;
		}

		if (activeStep === "avatar") {
			if (!userId) {
				setFormError("Сессия не найдена. Попробуйте войти заново.");
				return;
			}

			try {
				setIsSavingProfile(true);
				await updateUserProfile(userId, {
					avatarUrl: avatarUrl || undefined,
				});
				if (session) {
					setSession({
						...session,
						user: {
							...session.user,
							avatarUrl: avatarUrl || undefined,
						},
					});
				}
				setActiveStep("genres");
			} catch (error) {
				setFormError(
					error instanceof Error
						? error.message
						: "Не удалось сохранить аватар. Попробуйте еще раз.",
				);
			} finally {
				setIsSavingProfile(false);
			}
			return;
		}

		if (activeStep === "genres") {
			setActiveStep("goal");
		}
	};

	const skipStep = () => {
		clearError();
		const next = STEPS[activeStepIndex + 1];
		if (next) setActiveStep(next.id);
	};

	const goBack = () => {
		clearError();
		const prev = STEPS[activeStepIndex - 1];
		if (prev) setActiveStep(prev.id);
	};

	const finishOnboarding = async () => {
		clearError();

		if (activeStep !== "goal") {
			return;
		}

		if (!yearGoal) {
			setFormError("Введите цель на год.");
			return;
		}

		if (!userId) {
			setFormError("Сессия не найдена. Попробуйте войти заново.");
			return;
		}

		try {
			setIsSubmitting(true);

			const genresPromise =
				selectedGenres.length >= MIN_SELECTED_GENRES
					? updateUserGenres(userId, { genreIds: selectedGenres }).catch(
							() => {},
						)
					: Promise.resolve();

			const challengePromise =
				yearGoal > 0
					? (() => {
							const year = new Date().getFullYear();
							return createChallenge({
								type: "books",
								periodType: "year",
								targetValue: yearGoal,
								startDate: `${year}-01-01`,
								endDate: `${year}-12-31`,
								isActive: true,
							}).catch(() => {});
						})()
					: Promise.resolve();

			await Promise.all([genresPromise, challengePromise]);

			markWelcomeOnboardingCompleted(session.user);
			router.replace("/");
		} catch (error) {
			setFormError(
				error instanceof Error
					? error.message
					: "Не удалось завершить регистрацию. Попробуйте еще раз.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		activeStep,
		activeStepConfig,
		activeStepIndex,
		avatarUrl,
		canRenderWelcome,
		formError,
		hasUsernameError,
		isCheckingUsername,
		isNextDisabled,
		isSavingProfile,
		isSubmitting,
		name,
		selectedGenres,
		username,
		yearGoal,
		goBack,
		goNext,
		finishOnboarding,
		selectStep,
		setAvatarUrl: changeAvatar,
		setName: changeName,
		setUsername: changeUsername,
		setYearGoal: changeYearGoal,
		skipStep,
		toggleGenre,
	};
};
