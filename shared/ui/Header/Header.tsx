"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import styled from "styled-components";

import AuthModal, { type IAuthModalMode } from "@/components/pages/AuthModal";
import { useGenresQuery } from "@/shared/api/genres";
import { LogoIcon } from "@/public/icons/logo";
import { getAvatarAssetUrl } from "@/shared/api/avatarsRepository";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";
import { BookSearch } from "@/shared/ui/BookSearch";
import { Button } from "@/shared/ui/Button";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";

const navItems = [
	{
		href: "/",
		label: "Главная",
		match: (pathname: string) => pathname === "/",
	},
	{
		href: "/genres",
		hasGenresDropdown: true,
		label: "Жанры",
		match: (pathname: string) => pathname.startsWith("/genres"),
	},
	{
		href: "/authors",
		label: "Авторы",
		match: (pathname: string) => pathname.startsWith("/authors"),
	},
	{
		href: "/collections",
		label: "Подборки",
		match: (pathname: string) => pathname.startsWith("/collections"),
	},
];

const profileItems = [
	{ href: "/treasures", label: "Мои сокровища" },
	{ href: "/book-challenge", label: "Книжный вызов" },
];

const emptySubscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const AUTH_REQUIRED_MESSAGE =
	"Для данного действия, пожалуйста, авторизируйтесь.";
const isAuthRequiredRedirect = () =>
	typeof window !== "undefined" &&
	new URLSearchParams(window.location.search).get("auth") === "required";

const Header = () => {
	const pathname = usePathname();
	const router = useRouter();
	const isMounted = useSyncExternalStore(
		emptySubscribe,
		getClientSnapshot,
		getServerSnapshot,
	);

	const [authModalMode, setAuthModalMode] = useState<IAuthModalMode | null>(
		null,
	);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
	const session = useAuthStore((state) => state.session);
	const logout = useAuthStore((state) => state.logout);
	const { data: genres = [], isLoading: isGenresLoading } = useGenresQuery();
	const user = session?.user;
	const displayName = user?.name || user?.username || user?.email;
	const profileName = user?.name || user?.username || user?.email;
	const profileMeta = user?.username
		? `@${user.username}`
		: user?.email && user.email !== profileName
			? user.email
			: undefined;
	const avatarUrl = getAvatarAssetUrl(user?.avatarUrl);
	const isWelcomePage = pathname === "/welcome";
	const topGenres = [...genres]
		.slice(0, 30)
		.sort((a, b) => a.name.localeCompare(b.name, "ru"));
	const showAuthRequiredModal = isMounted && !user && isAuthRequiredRedirect();
	const visibleAuthModalMode =
		authModalMode ?? (showAuthRequiredModal ? "login" : null);
	const authModalMessage = showAuthRequiredModal ? AUTH_REQUIRED_MESSAGE : "";
	const userNavItems = user
		? [
				{
					href: "/treasures",
					label: "Мои сокровища",
					match: (currentPathname: string) =>
						currentPathname.startsWith("/treasures"),
				},
			]
		: [];
	const visibleNavItems = [...navItems, ...userNavItems];

	const closeProfileMenu = () => setIsProfileMenuOpen(false);

	const toggleProfileMenu = () => setIsProfileMenuOpen((current) => !current);
	const openAuthModal = (mode: IAuthModalMode) => {
		setAuthModalMode(mode);

		closeProfileMenu();
	};
	const closeAuthModal = () => {
		setAuthModalMode(null);

		if (isAuthRequiredRedirect()) {
			router.replace(pathname || "/", { scroll: false });
		}
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
						{visibleNavItems.map((item) => (
							<NavItem key={item.label}>
								<NavButton href={item.href} $active={item.match(pathname)}>
									{item.label}
								</NavButton>
								{"hasGenresDropdown" in item && item.hasGenresDropdown ? (
									<GenresDropdown>
										<GenresDropdownInner>
											<GenresDropdownTitle>Топ 30 жанров</GenresDropdownTitle>
											<GenresList>
												{isGenresLoading
													? Array.from({ length: 10 }, (_, index) => (
															<GenreSkeleton key={index} />
														))
													: topGenres.map((genre) => (
															<GenreDropdownLink
																key={genre.id}
																href={`/genres/${genre.slug}`}
															>
																{genre.name}
															</GenreDropdownLink>
														))}
											</GenresList>
										</GenresDropdownInner>
										<GenresDropdownFooter>
											<ViewAllGenresButton
												buttonType="containedInverted"
												href="/genres"
											>
												Посмотреть все
											</ViewAllGenresButton>
										</GenresDropdownFooter>
									</GenresDropdown>
								) : null}
							</NavItem>
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
								</UserChip>
								<ProfileMenu
									id="profile-navigation"
									aria-hidden={!isProfileMenuOpen}
									$isOpen={isProfileMenuOpen}
									aria-label="Меню профиля"
								>
									<ProfileMenuUser>
										<ProfileMenuName>{profileName}</ProfileMenuName>
										{profileMeta ? (
											<ProfileMenuEmail>{profileMeta}</ProfileMenuEmail>
										) : null}
									</ProfileMenuUser>
									{profileItems.map((item) =>
										item.href ? (
											<ProfileMenuLink
												key={item.label}
												href={item.href}
												onClick={closeProfileMenu}
											>
												{item.label}
											</ProfileMenuLink>
										) : (
											<ProfileMenuItem
												key={item.label}
												type="button"
												onClick={closeProfileMenu}
											>
												{item.label}
											</ProfileMenuItem>
										),
									)}
									<ProfileMenuLink href="/profile" onClick={closeProfileMenu}>
										Профиль
										<ProfileMenuHint>Редактирование</ProfileMenuHint>
									</ProfileMenuLink>
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
									buttonType="text"
									onClick={() => openAuthModal("register")}
								>
									Регистрация
								</AuthButton>
								<AuthButton
									type="button"
									buttonType="contained"
									onClick={() => openAuthModal("login")}
								>
									Вход
								</AuthButton>
							</>
						)}
					</AuthActions>
				</HeaderToolbar>
			</HeaderBar>
			{visibleAuthModalMode ? (
				<AuthModal
					mode={visibleAuthModalMode}
					message={authModalMessage}
					onClose={closeAuthModal}
					onModeChange={setAuthModalMode}
				/>
			) : null}
			{isLogoutConfirmOpen ? (
				<ConfirmModal
					confirmLabel="Выйти"
					title="Выйти из профиля?"
					onCancel={closeLogoutConfirm}
					onConfirm={confirmLogout}
				>
					Вы сможете вернуться в аккаунт после повторного входа.
				</ConfirmModal>
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

const NavItem = styled.div`
	position: relative;
	display: inline-flex;
	align-items: center;

	&::after {
		position: absolute;
		top: 100%;
		right: -1.25rem;
		left: -1.25rem;
		height: 1.35rem;
		content: "";
	}

	&:hover > div,
	&:focus-within > div {
		opacity: 1;
		pointer-events: auto;
		transform: translate(-50%, 0);
	}
`;

const NavButton = styled(Link)<{ $active: boolean }>`
	position: relative;
	display: inline-flex;
	align-items: center;
	min-width: auto;
	border-radius: 0;
	padding: 1.25rem 0.9rem 1.35rem;
	color: ${({ $active }) =>
		$active ? theme.colors.orangeLight : theme.colors.invertedText};
	font: inherit;
	font-family: ${theme.fonts.sans};
	font-size: 1.14rem;
	line-height: 1.35rem;
	text-decoration: none;
	text-transform: none;
	transition: color 180ms ease;

	&::after {
		position: absolute;
		right: 0.7rem;
		bottom: -0.0625rem;
		left: 0.7rem;
		height: 0.1875rem;
		border-radius: 62.4375rem;
		background: ${theme.colors.orangeLight};
		content: "";
		opacity: ${({ $active }) => ($active ? 1 : 0)};
		transform: scaleX(${({ $active }) => ($active ? 1 : 0.45)});
		transform-origin: center;
		transition:
			opacity 180ms ease,
			transform 180ms ease;
	}

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeLight};
		outline: none;
	}

	&:hover::after,
	&:focus-visible::after {
		opacity: 1;
		transform: scaleX(1);
	}
`;

const GenresDropdown = styled.div`
	position: absolute;
	top: calc(100% + 0.55rem);
	left: 50%;
	z-index: 20;
	display: flex;
	width: min(38rem, calc(100vw - 2rem));
	max-height: min(31rem, calc(100dvh - 7rem));
	flex-direction: column;
	overflow: hidden;
	border: 0.0625rem solid rgb(242 239 237 / 0.18);
	border-radius: 1.25rem;
	background: ${theme.colors.background};
	box-shadow: 0 1.25rem 4rem rgb(4 18 26 / 0.32);
	opacity: 0;
	pointer-events: none;
	transform: translate(-50%, -0.4rem);
	transition:
		opacity 160ms ease,
		transform 180ms ease;

	&::before {
		position: absolute;
		top: -0.6rem;
		right: 0;
		left: 0;
		height: 0.6rem;
		content: "";
	}
`;

const GenresDropdownInner = styled.div`
	overflow-y: auto;
	padding: 1rem 1.25rem 5.4rem;
`;

const GenresDropdownTitle = styled.h2`
	margin: 0 0 0.75rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.15rem;
	font-weight: 500;
	line-height: 1.2;
`;

const GenresList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
`;

const GenreDropdownLink = styled(Link)`
	display: inline-flex;
	align-items: center;
	min-height: 2rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.7);
	border-radius: 62.4375rem;
	background: ${theme.colors.surface};
	padding: 0.45rem 0.9rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	line-height: 1;
	text-decoration: none;
	white-space: nowrap;
	transition:
		border-color 160ms ease,
		color 160ms ease,
		transform 160ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
		transform: translateY(-0.0625rem);
	}
`;

const GenreSkeleton = styled.span`
	display: inline-flex;
	width: 5.6rem;
	height: 2rem;
	border-radius: 62.4375rem;
	background: linear-gradient(
		90deg,
		rgb(242 239 237 / 0.7),
		rgb(255 255 255 / 0.72),
		rgb(242 239 237 / 0.7)
	);
	background-size: 220% 100%;
	animation: genre-pulse 1.2s ease-in-out infinite;

	@keyframes genre-pulse {
		0% {
			background-position: 100% 50%;
		}

		100% {
			background-position: 0 50%;
		}
	}
`;

const GenresDropdownFooter = styled.div`
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: flex-end;
	border-top: 0.0625rem solid rgb(211 202 196 / 0.72);
	background:
		linear-gradient(
			180deg,
			rgb(232 226 222 / 0),
			${theme.colors.background} 26%
		),
		${theme.colors.background};
	padding: 1.1rem 1.25rem 1rem;
`;

const ViewAllGenresButton = styled(Button)`
	&& {
		padding: 0.6rem 1.25rem;
		font-family: ${theme.fonts.sans};
		font-size: 0.95rem;
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

const ProfileMenuUser = styled.div`
	padding: 0.65rem 0.75rem 0.7rem;
`;

const ProfileMenuName = styled.div`
	overflow: hidden;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.05rem;
	font-weight: 600;
	line-height: 1.2;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const ProfileMenuEmail = styled.div`
	overflow: hidden;
	margin-top: 0.18rem;
	color: ${theme.colors.softForeground};
	font-size: 0.76rem;
	line-height: 1.2;
	text-overflow: ellipsis;
	white-space: nowrap;
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

const ProfileMenuLink = styled(Link)`
	display: flex;
	width: 100%;
	flex-direction: column;
	align-items: flex-start;
	border-radius: 0.625rem;
	padding: 0.65rem 0.75rem;
	color: #233d4d;
	font: inherit;
	font-size: 0.95rem;
	font-weight: 600;
	text-align: left;
	text-decoration: none;
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
