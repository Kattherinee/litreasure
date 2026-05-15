"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import styled from "styled-components";

import AuthModal, { type AuthModalMode } from "@/components/pages/AuthModal";
import { LogoIcon } from "@/public/icons/logo";
import { getAvatarAssetUrl } from "@/shared/api/avatarsRepository";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { BookSearch } from "@/shared/ui/BookSearch";
import { Button } from "@/shared/ui/Button";

const navItems = ["Жанры", "Авторы", "Подборки", "Книжный трекинг"];

const profileItems = ["Профиль", "Мои сокровища", "Книжный вызов"];

const emptySubscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const Header = () => {
	const pathname = usePathname();
	const isMounted = useSyncExternalStore(
		emptySubscribe,
		getClientSnapshot,
		getServerSnapshot,
	);

	const [authModalMode, setAuthModalMode] = useState<AuthModalMode | null>(
		null,
	);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
	const session = useAuthStore((state) => state.session);
	const logout = useAuthStore((state) => state.logout);
	const user = session?.user;
	const displayName = user?.name || user?.username || user?.email;
	const avatarUrl = getAvatarAssetUrl(user?.avatarUrl);
	const isWelcomePage = pathname === "/welcome";

	const closeProfileMenu = () => setIsProfileMenuOpen(false);

	const toggleProfileMenu = () => setIsProfileMenuOpen((current) => !current);
	const openAuthModal = (mode: AuthModalMode) => {
		setAuthModalMode(mode);

		closeProfileMenu();
	};
	const openLogoutConfirm = () => {
		setIsLogoutConfirmOpen(true);

		closeProfileMenu();
	};
	const closeLogoutConfirm = () => setIsLogoutConfirmOpen(false);
	const confirmLogout = () => {
		logout();
		closeLogoutConfirm();
	};

	if (isWelcomePage) {
		return null;
	}

	if (!isMounted) {
		return (
			<header
				aria-hidden="true"
				style={{ height: 100, background: theme.colors.bluePrimary }}
			/>
		);
	}

	return (
		<>
			<HeaderBar position="sticky" elevation={0}>
				<HeaderToolbar>
					<BrandLink href="/" aria-label="Litreasure home">
						<LogoMark>
							<LogoIcon />
						</LogoMark>
						<BrandText>litreasure</BrandText>
					</BrandLink>

					<DesktopNav id="main-navigation" aria-label="Main navigation">
						{navItems.map((item) => (
							<NavButton key={item}>{item}</NavButton>
						))}
					</DesktopNav>

					<BookSearch />

					<AuthActions>
						{user ? (
							<ProfileMenuContainer
								onBlur={(event) => {
									if (!event.currentTarget.contains(event.relatedTarget)) {
										closeProfileMenu();
									}
								}}
							>
								<UserChip
									aria-controls="profile-navigation"
									aria-expanded={isProfileMenuOpen}
									title={displayName}
									type="button"
									onClick={toggleProfileMenu}
								>
									<Avatar $avatarUrl={avatarUrl}>
										{avatarUrl ? null : getInitials(displayName)}
									</Avatar>
									<UserName>{displayName}</UserName>
								</UserChip>
								<ProfileMenu
									id="profile-navigation"
									aria-hidden={!isProfileMenuOpen}
									$isOpen={isProfileMenuOpen}
									aria-label="Меню профиля"
								>
									{profileItems.map((item) => (
										<ProfileMenuItem
											key={item}
											type="button"
											onClick={closeProfileMenu}
										>
											{item}
											{item === "Профиль" ? (
												<ProfileMenuHint>Редактирование</ProfileMenuHint>
											) : null}
										</ProfileMenuItem>
									))}
									<ProfileMenuDivider />
									<ProfileLogoutItem type="button" onClick={openLogoutConfirm}>
										Выйти
									</ProfileLogoutItem>
								</ProfileMenu>
							</ProfileMenuContainer>
						) : (
							<>
								<AuthButton
									type="button"
									variant="text"
									onClick={() => openAuthModal("register")}
								>
									Регистрация
								</AuthButton>
								<AuthButton
									type="button"
									variant="contained"
									onClick={() => openAuthModal("login")}
								>
									Вход
								</AuthButton>
							</>
						)}
					</AuthActions>
				</HeaderToolbar>
			</HeaderBar>
			{authModalMode ? (
				<AuthModal
					mode={authModalMode}
					onClose={() => setAuthModalMode(null)}
					onModeChange={setAuthModalMode}
				/>
			) : null}
			{isLogoutConfirmOpen ? (
				<ConfirmOverlay role="presentation" onMouseDown={closeLogoutConfirm}>
					<ConfirmDialog
						aria-modal="true"
						role="dialog"
						aria-labelledby="logout-confirm-title"
						onMouseDown={(event) => event.stopPropagation()}
					>
						<ConfirmTitle id="logout-confirm-title">
							Выйти из профиля?
						</ConfirmTitle>
						<ConfirmText>
							Вы сможете вернуться в аккаунт после повторного входа.
						</ConfirmText>
						<ConfirmActions>
							<ConfirmSecondaryButton
								type="button"
								variant="outlined"
								onClick={closeLogoutConfirm}
							>
								Отмена
							</ConfirmSecondaryButton>
							<ConfirmPrimaryButton
								type="button"
								variant="containedInverted"
								onClick={confirmLogout}
							>
								Выйти
							</ConfirmPrimaryButton>
						</ConfirmActions>
					</ConfirmDialog>
				</ConfirmOverlay>
			) : null}
		</>
	);
};

export default Header;

const getInitials = (value?: string) => {
	if (!value) {
		return "L";
	}

	return value
		.split(/[\s._-]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
};

const HeaderBar = styled(AppBar)`
	&& {
		background: ${theme.colors.bluePrimary};
		color: ${theme.colors.invertedText};
		overflow: visible;
	}
`;

const HeaderToolbar = styled(Toolbar)`
	&& {
		position: relative;
		z-index: 2;
		display: flex;
		height: 4rem;
		align-items: center;
		gap: clamp(1.25rem, 3vw, 2.5rem);
		width: min(
			calc(100% - (${theme.layout.contentGutter} * 2)),
			${theme.layout.contentMaxWidth}
		);
		margin: 0 auto;
		padding: 0;

		@media (max-width: 56.25rem) {
			gap: 1rem;
		}

		@media (max-width: 40rem) {
			min-height: 4.625rem;
			flex-wrap: wrap;
			align-content: center;
			gap: 0.75rem;
			padding: 0.75rem 0;
		}
	}
`;

const BrandLink = styled.a`
	display: flex;
	align-items: center;
	flex-shrink: 0;
	gap: 0.85rem;
	color: inherit;
	text-decoration: none;
`;

const LogoMark = styled.span`
	display: inline-flex;
	width: 3rem;
	height: 3rem;
	flex: 0 0 3rem;
	align-items: center;
	justify-content: center;

	& svg {
		width: 100%;
		height: 100%;
		display: block;
	}
`;

const BrandText = styled.div`
	padding-top: 0.125rem;
	font-family: ${theme.fonts.serif};
	font-size: 20px;
	font-weight: 600;
	line-height: 32px;
	text-transform: uppercase;
`;

const DesktopNav = styled.nav`
	display: flex;
	align-items: center;
	gap: 8px;

	@media (max-width: 900px) {
		display: none;
	}
`;

const NavButton = styled(MuiButton)`
	&& {
		min-width: auto;
		padding: 0.75rem 0.75rem 1rem;
		color: ${theme.colors.invertedText};
		font: inherit;
		text-transform: none;
	}
`;

const AuthActions = styled(Box)`
	position: relative;
	display: flex;
	align-items: center;
	gap: 12px;

	@media (max-width: 720px) {
		margin-left: auto;
	}

	@media (max-width: 520px) {
		display: none;
	}
`;

const AuthButton = styled(Button)``;

const ProfileMenuContainer = styled.div`
	position: relative;
`;

const UserChip = styled.button`
	display: inline-flex;
	align-items: center;
	min-width: 0;
	gap: 0.5rem;
	border: 0;
	border-radius: 999px;
	background: transparent;
	padding: 0.25rem 0.85rem 0.25rem 0.45rem;
	color: ${theme.colors.invertedText};
	cursor: pointer;

	&:hover,
	&:focus-visible {
		background: rgb(242 239 237 / 0.12);
		outline: none;
	}
`;

const Avatar = styled.span<{ $avatarUrl?: string }>`
	display: inline-flex;
	width: 2.7rem;
	height: 2.7rem;
	flex: 0 0 auto;
	align-items: center;
	justify-content: center;
	border: 0.0625rem solid rgb(242 239 237 / 0.36);
	border-radius: 50%;
	background: ${({ $avatarUrl }) =>
		$avatarUrl
			? `url("${$avatarUrl}") center / cover no-repeat`
			: theme.colors.orangeLight};
	color: ${theme.colors.bluePrimary};
	font-family: ${theme.fonts.sans};
	font-size: 0.8rem;
	font-weight: 700;
	line-height: 1;
`;

const UserName = styled.span`
	display: inline-block;
	max-width: 8rem;
	overflow: hidden;
	color: ${theme.colors.invertedText};
	font-size: 1.175rem;
	line-height: 1.2;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-family: ${theme.fonts.serif};

	@media (max-width: 66rem) {
		display: none;
	}
`;

const ProfileMenu = styled.div<{ $isOpen: boolean }>`
	position: absolute;
	z-index: 4;
	top: calc(100% + 0.75rem);
	right: 0;
	width: 14rem;
	border: 0.0625rem solid rgb(238 179 141 / 0.65);
	border-radius: 0.875rem;
	background: #e8e2de;
	box-shadow: 0 1rem 2.5rem rgb(4 18 26 / 0.18);
	opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
	padding: 0.45rem;
	pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
	transform: translateY(${({ $isOpen }) => ($isOpen ? "0" : "-0.4rem")});
	transition:
		opacity 160ms ease,
		transform 180ms ease;
`;

const ProfileMenuItem = styled.button`
	display: flex;
	width: 100%;
	flex-direction: column;
	align-items: flex-start;
	border: 0;
	border-radius: 0.625rem;
	background: transparent;
	padding: 0.65rem 0.75rem;
	color: #233d4d;
	font: inherit;
	font-size: 0.95rem;
	font-weight: 600;
	text-align: left;
	cursor: pointer;

	&:hover,
	&:focus-visible {
		background: rgb(218 142 91 / 0.12);
		color: #d4641c;
		outline: none;
	}
`;

const ProfileMenuHint = styled.span`
	margin-top: 0.15rem;
	color: ${theme.colors.softForeground};
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 1.2;
`;

const ProfileMenuDivider = styled.div`
	height: 0.0625rem;
	margin: 0.35rem 0.25rem;
	background: rgb(186 183 180 / 0.5);
`;

const ProfileLogoutItem = styled(ProfileMenuItem)`
	color: #d4641c;

	&:hover,
	&:focus-visible {
		background: rgb(212 100 28 / 0.12);
		color: #b64f12;
	}
`;

const ConfirmOverlay = styled.div`
	position: fixed;
	z-index: 60;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.48);
	padding: 1rem;
`;

const ConfirmDialog = styled.section`
	width: min(100%, 24rem);
	border: 0.0625rem solid #eeb38d;
	border-radius: 1rem;
	background: #e8e2de;
	padding: 1.5rem;
	box-shadow: 0 1.25rem 3rem rgb(4 18 26 / 0.16);
`;

const ConfirmTitle = styled.h2`
	margin: 0;
	color: #04121a;
	font-family: ${theme.fonts.serif};
	font-size: 1.5rem;
	font-weight: 600;
	line-height: 1.2;
`;

const ConfirmText = styled.p`
	margin: 0.75rem 0 1.25rem;
	color: ${theme.colors.softForeground};
	font-size: 0.95rem;
	line-height: 1.45;
`;

const ConfirmActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
`;

const ConfirmSecondaryButton = styled(Button)``;

const ConfirmPrimaryButton = styled(Button)``;
