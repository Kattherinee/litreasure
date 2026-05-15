"use client";

import type { PropsWithChildren } from "react";
import styled from "styled-components";

import { theme } from "@/shared/theme";

import { STEP_IMAGES, STEP_SUBTITLES, STEPS, type WelcomeStep } from "./types";

interface WelcomeLayoutProps extends PropsWithChildren {
	activeStep: WelcomeStep;
	activeStepIndex: number;
}

export const WelcomeLayout = ({
	activeStep,
	activeStepIndex,
	children,
}: WelcomeLayoutProps) => (
	<Page $step={activeStep}>
		<PageInner $step={activeStep}>
			<LeftPanel>
				<LeftInner>
					<LeftContent>
						<LeftStep>
							{String(activeStepIndex + 1).padStart(2, "0")} /{" "}
							{String(STEPS.length).padStart(2, "0")}
						</LeftStep>
						<LeftTitle>
							Добро пожаловать
							<br />в Litreasure
						</LeftTitle>
						<LeftSubtitle>{STEP_SUBTITLES[activeStep]}</LeftSubtitle>
					</LeftContent>
					<DragonImg alt="" src={STEP_IMAGES[activeStep]} />
				</LeftInner>
			</LeftPanel>

			<RightPanel>
				<RightInner $step={activeStep}>{children}</RightInner>
			</RightPanel>
		</PageInner>
	</Page>
);

const Page = styled.div<{ $step: WelcomeStep }>`
	display: flex;
	align-items: center;
	justify-content: center;
	height: calc(100dvh - 4rem);
	overflow: hidden;
	background: ${theme.colors.background};

	@media (max-width: 56rem) {
		display: block;
		height: auto;
		overflow: visible;
	}
`;

const PageInner = styled.div<{ $step: WelcomeStep }>`
	display: grid;
	width: min(
		100%,
		${({ $step }) =>
			$step === "genres" ? "82rem" : $step === "avatar" ? "72rem" : "58rem"}
	);
	grid-template-columns: ${({ $step }) =>
		$step === "genres"
			? "minmax(18rem, 25rem) minmax(0, 58rem)"
			: $step === "avatar"
				? "minmax(18rem, 25rem) minmax(0, 48rem)"
				: "minmax(18rem, 25rem) minmax(0, 28rem)"};
	align-items: center;
	gap: clamp(2.25rem, 4.5vw, 4rem);
	padding: 2.5rem clamp(2rem, 5vw, 4rem);
	transform: translateY(-4vh);
	transition:
		grid-template-columns 350ms ease,
		width 350ms ease;

	@media (max-width: 64rem) {
		padding: 2rem 1.5rem;
		gap: 1.5rem;
	}

	@media (max-width: 56rem) {
		display: block;
		width: 100%;
		transform: none;
	}
`;

const LeftPanel = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	overflow: hidden;

	@media (max-width: 56rem) {
		display: none;
	}
`;

const LeftInner = styled.div`
	position: relative;
	display: flex;
	width: 100%;
	max-width: 25rem;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
`;

const LeftContent = styled.div`
	position: relative;
	z-index: 2;
	margin: 0 0 1rem;
`;

const LeftStep = styled.span`
	display: block;
	margin-bottom: 1rem;
	color: #da8e5b;
	font-size: 0.8rem;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	opacity: 0.8;
`;

const LeftTitle = styled.h1`
	margin: 0;
	color: #04121a;
	font-family: ${theme.fonts.serif};
	font-size: clamp(1.95rem, 2.5vw, 2.25rem);
	font-weight: 600;
	line-height: 1.08;
`;

const LeftSubtitle = styled.p`
	max-width: 18rem;
	margin: 0.9rem 0 0;
	color: #233d4d;
	font-size: 0.95rem;
	font-weight: 600;
	line-height: 1.4;
`;

const DragonImg = styled.img`
	position: relative;
	z-index: 1;
	width: min(88%, 22rem);
	align-self: center;
	object-fit: contain;
	object-position: bottom;
	transition: opacity 300ms ease;
`;

const RightPanel = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	overflow: hidden;

	@media (max-width: 56rem) {
		min-height: 100dvh;
		padding: 2rem 1.5rem;
		overflow: visible;
	}
`;

const RightInner = styled.div<{ $step: WelcomeStep }>`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: ${({ $step }) =>
		$step === "genres" ? "58rem" : $step === "avatar" ? "48rem" : "28rem"};
	flex: 0 1 auto;
	min-height: 0;
	transition: max-width 350ms ease;
`;
