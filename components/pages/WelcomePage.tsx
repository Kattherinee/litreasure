"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import styled from "styled-components";

import {
clearRegisterDraft,
getRegisterDraft,
} from "@/components/pages/AuthModal";
import { checkUsernameAvailability, useRegisterMutation } from "@/shared/api/auth";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";

import { AvatarStep } from "./welcome/AvatarStep";
import { GenresStep } from "./welcome/GenresStep";
import { GoalStep } from "./welcome/GoalStep";
import { ProfileStep } from "./welcome/ProfileStep";
import {
MIN_SELECTED_GENRES,
ONBOARDING_STORAGE_KEY,
STEP_IMAGES,
STEP_SUBTITLES,
STEPS,
type WelcomeStep,
} from "./welcome/types";

const WelcomePage = () => {
const router = useRouter();
const setSession = useAuthStore((state) => state.setSession);
const registerMutation = useRegisterMutation();

const [activeStep, setActiveStep] = useState<WelcomeStep>("profile");
const [name, setName] = useState("");
const [username, setUsername] = useState("");
const [avatarUrl, setAvatarUrl] = useState("");
const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
const [yearGoal, setYearGoal] = useState(24);
const [formError, setFormError] = useState("");
const [isCheckingUsername, setIsCheckingUsername] = useState(false);

const activeStepIndex = STEPS.findIndex((step) => step.id === activeStep);
const activeStepConfig = STEPS[activeStepIndex];

const isNextDisabled =
(activeStep === "profile" && (!name.trim() || username.trim().length < 3)) ||
(activeStep === "avatar" && !avatarUrl) ||
(activeStep === "genres" && selectedGenres.length < MIN_SELECTED_GENRES) ||
isCheckingUsername;

const toggleGenre = (slug: string) => {
setSelectedGenres((current) =>
current.includes(slug)
? current.filter((genre) => genre !== slug)
: [...current, slug],
);
};

const goNext = async () => {
setFormError("");
if (activeStep === "profile") {
setIsCheckingUsername(true);
try {
const available = await checkUsernameAvailability(username.trim());
if (!available) {
setFormError("Этот username уже занят. Попробуйте другой.");
return;
}
} finally {
setIsCheckingUsername(false);
}
setActiveStep("avatar");
return;
}
if (activeStep === "avatar") {
setActiveStep("genres");
return;
}
if (activeStep === "genres") {
setActiveStep("goal");
}
};

const skipStep = () => {
setFormError("");
const next = STEPS[activeStepIndex + 1];
if (next) setActiveStep(next.id);
};

const goBack = () => {
setFormError("");
const prev = STEPS[activeStepIndex - 1];
if (prev) setActiveStep(prev.id);
};

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();
setFormError("");

const draft = getRegisterDraft();

if (!draft) {
setFormError("Начните регистрацию заново: не найден email и пароль.");
return;
}

if (!yearGoal) {
setFormError("Введите цель на год.");
return;
}

try {
const session = await registerMutation.mutateAsync({
email: draft.email,
password: draft.password,
name: name.trim(),
username: username.trim(),
avatarUrl,
});

if (typeof window !== "undefined") {
window.localStorage.setItem(
ONBOARDING_STORAGE_KEY,
JSON.stringify({ genres: selectedGenres, yearGoal }),
);
}

clearRegisterDraft();
setSession(session);
router.push("/");
} catch (error) {
setFormError(
error instanceof Error
? error.message
: "Не удалось завершить регистрацию. Попробуйте еще раз.",
);
}
};

return (
<Page $step={activeStep}>
<LeftPanel>
<LeftContent>
<LeftStep>
{String(activeStepIndex + 1).padStart(2, "0")} /{" "}
{String(STEPS.length).padStart(2, "0")}
</LeftStep>
<LeftTitle>
Welcome to
<br />
Litreasure
</LeftTitle>
<LeftSubtitle>{STEP_SUBTITLES[activeStep]}</LeftSubtitle>
</LeftContent>
<DragonImg alt="" src={STEP_IMAGES[activeStep]} />
</LeftPanel>

<RightPanel>
<RightInner $step={activeStep}>
<Tabs aria-label="Этапы регистрации">
{STEPS.map((step, index) => {
const isActive = step.id === activeStep;
const isComplete = index < activeStepIndex;
return (
<TabButton
key={step.id}
type="button"
$isActive={isActive}
$isComplete={isComplete}
onClick={() => {
if (index <= activeStepIndex) {
setActiveStep(step.id);
setFormError("");
}
}}
>
<TabLine $isActive={isActive} $isComplete={isComplete} />
</TabButton>
);
})}
</Tabs>

<OnboardingForm onSubmit={handleSubmit}>
{activeStep === "profile" ? (
<ProfileStep
name={name}
username={username}
onNameChange={setName}
onUsernameChange={setUsername}
/>
) : null}

{activeStep === "avatar" ? (
<AvatarStep avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} />
) : null}

{activeStep === "genres" ? (
<GenresStep selectedGenres={selectedGenres} onToggle={toggleGenre} />
) : null}

{activeStep === "goal" ? (
<GoalStep yearGoal={yearGoal} onGoalChange={setYearGoal} />
) : null}

{formError ? <ErrorText role="alert">{formError}</ErrorText> : null}

<Actions>
{activeStepIndex > 0 ? (
<SecondaryButton type="button" variant="outlined" onClick={goBack}>
Назад
</SecondaryButton>
) : null}
<RightActions>
{activeStepConfig?.skippable ? (
<SkipButton type="button" onClick={skipStep}>
Пропустить
</SkipButton>
) : null}
{activeStep === "goal" ? (
<PrimaryButton disabled={registerMutation.isPending} type="submit">
Завершить
</PrimaryButton>
) : (
<PrimaryButton
disabled={isNextDisabled}
type="button"
onClick={goNext}
>
{isCheckingUsername ? "Проверяем..." : "Дальше"}
</PrimaryButton>
)}
</RightActions>
</Actions>
</OnboardingForm>
</RightInner>
</RightPanel>
</Page>
);
};

export default WelcomePage;

/* ── Layout ─────────────────────────────────────────────── */

const Page = styled.div<{ $step: WelcomeStep }>`
display: grid;
grid-template-columns: ${({ $step }) =>
$step === "genres" ? "2fr 3fr" : "1fr 1fr"};
height: calc(100dvh - 4rem);
overflow: hidden;
background: ${theme.colors.background};
transition: grid-template-columns 350ms ease;

@media (max-width: 56rem) {
grid-template-columns: 1fr;
height: auto;
overflow: visible;
}
`;

const LeftPanel = styled.div`
position: relative;
display: flex;
flex-direction: column;
align-items: flex-end;
justify-content: flex-end;
overflow: hidden;

@media (max-width: 56rem) {
display: none;
}
`;

const LeftContent = styled.div`
position: absolute;
top: 3rem;
left: 4.5rem;
z-index: 1;
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
font-size: 2.5rem;
font-weight: 600;
line-height: 1.1;
`;

const LeftSubtitle = styled.p`
margin: 0.75rem 0 0;
color: #233d4d;
font-size: 1.05rem;
font-weight: 600;
line-height: 1.4;
`;

const DragonImg = styled.img`
position: relative;
z-index: 1;
width: min(95%, 26rem);
transform: translateX(8%);
object-fit: contain;
object-position: bottom;
transition: opacity 300ms ease;
`;

const RightPanel = styled.div`
display: flex;
flex-direction: column;
align-items: center;
padding: 2.5rem 3rem;
overflow: hidden;

@media (max-width: 64rem) {
padding: 2rem 1.5rem;
}

@media (max-width: 56rem) {
min-height: 100dvh;
overflow: visible;
}
`;

const RightInner = styled.div<{ $step: WelcomeStep }>`
display: flex;
flex-direction: column;
width: 100%;
max-width: ${({ $step }) => ($step === "genres" ? "44rem" : "30rem")};
flex: 1;
min-height: 0;
transition: max-width 350ms ease;
`;

/* ── Tabs ─────────────────────────────────────────────────── */

const Tabs = styled.div`
display: flex;
align-items: flex-start;
gap: 0.5rem;
`;

const TabButton = styled.button<{ $isActive: boolean; $isComplete: boolean }>`
display: flex;
flex: ${({ $isActive }) => ($isActive ? 3 : 1)};
flex-direction: column;
align-items: stretch;
border: 0;
background: transparent;
padding: 0;
cursor: ${({ $isComplete, $isActive }) =>
$isComplete || $isActive ? "pointer" : "default"};
transition: flex 300ms ease;
`;

const TabLine = styled.span<{ $isActive: boolean; $isComplete: boolean }>`
display: block;
width: 100%;
height: 0.1875rem;
border-radius: 999px;
background: ${({ $isActive, $isComplete }) =>
$isActive ? "#da8e5b" : $isComplete ? "rgb(218 142 91 / 0.5)" : "#ddd6d2"};
transition: background 200ms ease;
`;

/* ── Form & Actions ──────────────────────────────────────── */

const OnboardingForm = styled.form`
display: flex;
flex: 1;
flex-direction: column;
gap: 1.25rem;
margin-top: 2rem;
min-height: 0;
`;

const ErrorText = styled.p`
margin: 0;
color: #d4641c;
font-size: 0.875rem;
line-height: 1.4;
`;

const Actions = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
gap: 0.75rem;
padding-top: 0.5rem;

@media (max-width: 30rem) {
flex-direction: column-reverse;
}
`;

const RightActions = styled.div`
display: flex;
align-items: center;
gap: 0.75rem;
`;

const SkipButton = styled.button`
border: 0;
background: transparent;
padding: 0;
color: #bab7b4;
font: inherit;
font-size: 0.875rem;
text-decoration: underline;
cursor: pointer;

&:hover {
color: ${theme.colors.softForeground};
}
`;

const PrimaryButton = styled(Button)`
&& {
background: #da8e5b;
border-color: #da8e5b;
color: #f2efed;

&:disabled {
opacity: 0.4;
cursor: not-allowed;
}
}
`;

const SecondaryButton = styled(Button)``;
