"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import styled from "styled-components";

import {
	type LoginPayload,
	useLoginMutation,
	useRegisterMutation,
} from "@/shared/api/auth";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { InputField } from "@/shared/ui/InputField";

export type AuthModalMode = "login" | "register";

type AuthModalProps = {
	mode: AuthModalMode;
	onClose: () => void;
	onModeChange?: (mode: AuthModalMode) => void;
};

type RegisterForm = LoginPayload & {
	confirmPassword: string;
};

const initialForm: RegisterForm = {
	email: "",
	password: "",
	confirmPassword: "",
};

const AuthModal = ({ mode, onClose, onModeChange }: AuthModalProps) => {
	const router = useRouter();
	const setSession = useAuthStore((state) => state.setSession);
	const loginMutation = useLoginMutation();
	const registerMutation = useRegisterMutation();
	const [form, setForm] = useState<RegisterForm>(initialForm);
	const [formError, setFormError] = useState("");
	const [touched, setTouched] = useState({
		email: false,
		password: false,
		confirmPassword: false,
	});
	const isRegister = mode === "register";

	const touch = (field: keyof typeof touched) =>
		setTouched((t) => ({ ...t, [field]: true }));

	const fieldErrors = {
		email:
			touched.email &&
			form.email.length > 0 &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
				? "Некорректный email"
				: "",
		password:
			touched.password && form.password.length > 0 && form.password.length < 6
				? "Минимум 6 символов"
				: "",
		confirmPassword:
			isRegister &&
			touched.confirmPassword &&
			form.confirmPassword.length > 0 &&
			form.password !== form.confirmPassword
				? "Пароли не совпадают"
				: "",
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError("");

		try {
			if (isRegister) {
				if (form.password !== form.confirmPassword) {
					setFormError("Passwords do not match.");
					return;
				}

				const session = await registerMutation.mutateAsync({
					email: form.email.trim(),
					password: form.password,
				});

				setSession(session);
				onClose();
				router.push("/welcome");
				return;
			}

			const session = await loginMutation.mutateAsync({
				email: form.email.trim(),
				password: form.password,
			});

			setSession(session);
			onClose();
			router.push("/");
		} catch (error) {
			setFormError(
				error instanceof Error
					? error.message
					: "Could not complete the request. Try again.",
			);
		}
	};

	const switchMode = (nextMode: AuthModalMode) => {
		setFormError("");
		setTouched({ email: false, password: false, confirmPassword: false });
		onModeChange?.(nextMode);
	};

	return (
		<Overlay role="presentation" onMouseDown={onClose}>
			<Dialog
				aria-modal="true"
				role="dialog"
				aria-labelledby="auth-modal-title"
				$isRegister={isRegister}
				onMouseDown={(event) => event.stopPropagation()}
			>
				<CloseButton type="button" aria-label="Close modal" onClick={onClose}>
					<span />
					<span />
				</CloseButton>

				<Tabs aria-label="Authentication mode">
					<TabButton
						type="button"
						$isActive={!isRegister}
						$inactiveWidth={70}
						onClick={() => switchMode("login")}
					>
						<TabLabel>Login</TabLabel>
						<TabLine $isActive={!isRegister} />
					</TabButton>
					<TabButton
						type="button"
						$isActive={isRegister}
						$inactiveWidth={80}
						onClick={() => switchMode("register")}
					>
						<TabLabel>Register</TabLabel>
						<TabLine $isActive={isRegister} />
					</TabButton>
				</Tabs>

				<Intro $isRegister={isRegister}>
					<IntroCopy>
						<Title id="auth-modal-title">
							{isRegister ? "Join Litreasure" : "Sign in your account"}
						</Title>
						{isRegister ? (
							<Subtitle>
								Sign up and start collecting yor paper treasures
							</Subtitle>
						) : null}
					</IntroCopy>
					<DragonImage
						alt=""
						$isRegister={isRegister}
						src={
							isRegister
								? "/images/drakoSword1.png"
								: "/images/drakoTreasure1.png"
						}
					/>
				</Intro>

				<AuthForm onSubmit={handleSubmit}>
					<Fields $isRegister={isRegister}>
						<FieldGroup>
							<Label htmlFor="auth-email">Email</Label>
							<StyledInput
								id="auth-email"
								autoComplete="email"
								required
								type="email"
								value={form.email}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										email: event.target.value,
									}))
								}
								onBlur={() => touch("email")}
							/>
							{fieldErrors.email ? (
								<FieldError>{fieldErrors.email}</FieldError>
							) : null}
						</FieldGroup>

						<FieldGroup>
							<Label htmlFor="auth-password">Password</Label>
							<StyledInput
								id="auth-password"
								autoComplete={isRegister ? "new-password" : "current-password"}
								minLength={6}
								required
								type="password"
								value={form.password}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										password: event.target.value,
									}))
								}
								onBlur={() => touch("password")}
							/>
							{fieldErrors.password ? (
								<FieldError>{fieldErrors.password}</FieldError>
							) : null}
						</FieldGroup>

						{isRegister ? (
							<FieldGroup>
								<Label htmlFor="auth-confirm-password">Confirm Password</Label>
								<StyledInput
									id="auth-confirm-password"
									autoComplete="new-password"
									minLength={6}
									required
									type="password"
									value={form.confirmPassword}
									onChange={(event) =>
										setForm((current) => ({
											...current,
											confirmPassword: event.target.value,
										}))
									}
									onBlur={() => touch("confirmPassword")}
								/>
								{fieldErrors.confirmPassword ? (
									<FieldError>{fieldErrors.confirmPassword}</FieldError>
								) : null}
							</FieldGroup>
						) : null}
					</Fields>

					{formError ? <ErrorText role="alert">{formError}</ErrorText> : null}

					<SubmitButton
						disabled={loginMutation.isPending || registerMutation.isPending}
						type="submit"
					>
						{isRegister ? "Create account" : "Sign in"}
					</SubmitButton>
				</AuthForm>

				<SwitchText>
					{isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
					<SwitchButton
						type="button"
						onClick={() => switchMode(isRegister ? "login" : "register")}
					>
						{isRegister ? "Sign in" : "Create one"}
					</SwitchButton>
				</SwitchText>
			</Dialog>
		</Overlay>
	);
};

export default AuthModal;

const Overlay = styled.div`
	position: fixed;
	z-index: 50;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.48);
	padding: 1rem;
`;

const Dialog = styled.section<{ $isRegister: boolean }>`
	box-sizing: border-box;
	position: relative;
	display: flex;
	width: min(100%, 32rem);
	min-height: ${({ $isRegister }) =>
		$isRegister ? "33.0625rem" : "26.375rem"};
	flex-direction: column;
	align-items: flex-start;
	border: 0.0625rem solid #eeb38d;
	border-radius: 1rem;
	background: #e8e2de;
	padding: 1.5rem;

	@media (max-width: 48rem) {
		min-height: auto;
		padding: 1.5rem;
	}
`;

const CloseButton = styled.button`
	position: absolute;
	top: 1rem;
	right: 1rem;
	display: grid;
	width: 2rem;
	height: 2rem;
	place-items: center;
	border: 0;
	border-radius: 999px;
	background: transparent;
	padding: 0;
	cursor: pointer;

	span {
		grid-area: 1 / 1;
		width: 1rem;
		height: 0.125rem;
		border-radius: 999px;
		background: #2e363c;
	}

	span:first-child {
		transform: rotate(45deg);
	}

	span:last-child {
		transform: rotate(-45deg);
	}

	&:hover,
	&:focus-visible {
		background: rgb(218 142 91 / 0.16);
		outline: none;
	}
`;

const Tabs = styled.div`
	display: flex;
	width: 100%;
	height: 1.875rem;
	align-items: stretch;
	justify-content: center;
	gap: 0.25rem;
	padding-right: 2.25rem;
`;

const TabButton = styled.button<{
	$isActive: boolean;
	$inactiveWidth: number;
}>`
	display: flex;
	width: ${({ $isActive, $inactiveWidth }) =>
		$isActive ? "100%" : `${$inactiveWidth / 16}rem`};
	height: 1.875rem;
	min-width: 0;
	flex-direction: column;
	align-items: stretch;
	justify-content: space-between;
	gap: 0;
	border: 0;
	background: transparent;
	padding: 0;
	color: ${({ $isActive }) => ($isActive ? "#2e363c" : "#bab7b4")};
	font-family: ${theme.fonts.sans};
	font-size: 0.875rem;
	font-weight: 700;
	line-height: 1.25rem;
	cursor: pointer;

	@media (max-width: 48rem) {
		width: 100%;
	}
`;

const TabLabel = styled.span`
	display: block;
	height: 1.25rem;
	text-align: center;
`;

const TabLine = styled.span<{ $isActive: boolean }>`
	display: block;
	width: 100%;
	height: 0.1875rem;
	flex: 0 0 0.1875rem;
	border-radius: 999px;
	background: ${({ $isActive }) => ($isActive ? "#da8e5b" : "#bab7b4")};
`;

const Intro = styled.div<{ $isRegister: boolean }>`
	display: flex;
	width: 100%;
	min-height: ${({ $isRegister }) => ($isRegister ? "7.9375rem" : "6rem")};
	align-items: ${({ $isRegister }) => ($isRegister ? "flex-start" : "center")};
	justify-content: space-between;
	padding: ${({ $isRegister }) =>
		$isRegister ? "1.5rem 0.5rem 0" : "1rem 0.75rem 0 0"};

	@media (max-width: 40rem) {
		padding-inline: 0;
	}
`;

const IntroCopy = styled.div`
	min-width: 0;
`;

const Title = styled.h2`
	margin: 0;
	color: #04121a;
	font-family: ${theme.fonts.serif};
	font-size: 1.75rem;
	font-weight: 600;
	line-height: 1.875rem;

	@media (max-width: 30rem) {
		font-size: 1.5rem;
	}
`;

const Subtitle = styled.p`
	margin: 0.5rem 0 0;
	color: #2e363c;
	font-family: ${theme.fonts.sans};
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.25rem;

	@media (max-width: 30rem) {
		font-size: 0.9rem;
	}
`;

const DragonImage = styled.img<{ $isRegister: boolean }>`
	width: ${({ $isRegister }) => ($isRegister ? "6.25rem" : "5.3125rem")};
	height: ${({ $isRegister }) => ($isRegister ? "6.4375rem" : "5rem")};
	flex: 0 0 auto;
	object-fit: contain;

	@media (max-width: 40rem) {
		width: 4.75rem;
		height: 4.75rem;
	}
`;

const AuthForm = styled.form`
	display: flex;
	width: 100%;
	flex-direction: column;
	align-items: stretch;
`;

const Fields = styled.div<{ $isRegister: boolean }>`
	display: flex;
	width: 100%;
	flex-direction: column;
	gap: 0.75rem;
	padding: 0 0 2rem;
`;

const FieldGroup = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;
	gap: 0.125rem;
`;

const Label = styled.label`
	color: #233d4d;
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	font-weight: 400;
	line-height: 1.5rem;

	@media (max-width: 30rem) {
		font-size: 0.95rem;
	}
`;

const StyledInput = styled(InputField)`
	min-height: 2.375rem;
	border: 0.0625rem solid #bab7b4;
	border-radius: 1rem;
	background: #ddd6d2;
	padding: 0.375rem 0.875rem;
	color: #04121a;
	font-size: 1rem;

	&:hover:not(:disabled),
	&:focus,
	&:focus-visible {
		border-color: #da8e5b;
		background: #ddd6d2;
	}

	@media (max-width: 48rem) {
		min-height: 3.25rem;
		font-size: 1rem;
	}
`;

const ErrorText = styled.p`
	margin: -1rem 0 0.75rem;
	color: #d4641c;
	font-size: 0.95rem;
	line-height: 1.35;
`;

const FieldError = styled.p`
	margin: 0.125rem 0 0 0.875rem;
	color: #d4641c;
	font-size: 0.8125rem;
	line-height: 1.3;
`;

const SubmitButton = styled.button`
	display: flex;
	width: 100%;
	height: 2.625rem;
	align-items: center;
	justify-content: center;
	border: 0;
	border-radius: 999px;
	background: #da8e5b;
	padding: 0 3.75rem;
	color: #f2efed;
	font-family: ${theme.fonts.serif};
	font-size: 1.125rem;
	font-weight: 700;
	line-height: 1.875rem;
	cursor: pointer;
	transition:
		background-color 180ms ease,
		color 180ms ease;

	&:hover,
	&:focus-visible {
		background: #233d4d;
		outline: none;
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.65;
	}

	@media (max-width: 48rem) {
		height: 3rem;
		font-size: 1.125rem;
	}
`;

const SwitchText = styled.p`
	width: 100%;
	margin: 1.5rem 0 0;
	color: #000;
	font-family: ${theme.fonts.sans};
	font-size: 0.875rem;
	font-weight: 300;
	line-height: 1.125rem;
	text-align: center;

	@media (max-width: 48rem) {
		margin-top: 1.5rem;
		font-size: 1rem;
	}
`;

const SwitchButton = styled.button`
	border: 0;
	background: transparent;
	padding: 0;
	color: #04121a;
	font: inherit;
	text-decoration: underline;
	cursor: pointer;

	&:hover,
	&:focus-visible {
		color: #d4641c;
		outline: none;
	}
`;
