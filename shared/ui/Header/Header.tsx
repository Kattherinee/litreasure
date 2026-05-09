"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { useState, useSyncExternalStore } from "react";
import styled from "styled-components";

import { LogoIcon } from "@/public/icons/logo";
import { Button } from "@/shared/ui/Button";
import { InputField } from "@/shared/ui/InputField";
import { theme } from "@/shared/theme";

const navItems = ["Жанры", "Книжные полки", "Книжный трекинг"];
const overflowItems = [
	"Рейтинги ?",
	"Жанры",
	"Авторы",
	"Подборки",
	"Книжный вызов",
];

const emptySubscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const Header = () => {
	const isMounted = useSyncExternalStore(
		emptySubscribe,
		getClientSnapshot,
		getServerSnapshot,
	);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const closeMenu = () => setIsMenuOpen(false);
	const openMenu = () => setIsMenuOpen(true);
	const toggleMenu = () => setIsMenuOpen((current) => !current);

	if (!isMounted) {
		return (
			<header
				aria-hidden="true"
				style={{ height: 100, background: theme.colors.bluePrimary }}
			/>
		);
	}

	return (
		<HeaderBar position="sticky" elevation={0}>
			<HeaderToolbar>
				<LogoMenuContainer
					onBlur={(event) => {
						if (!event.currentTarget.contains(event.relatedTarget)) {
							closeMenu();
						}
					}}
					onFocus={openMenu}
					onMouseEnter={openMenu}
					onMouseLeave={closeMenu}
				>
					<MenuButton
						aria-label="Открыть дополнительное меню"
						aria-expanded={isMenuOpen}
						aria-controls="overflow-navigation"
						onClick={toggleMenu}
					>
						<BurgerLine />
						<BurgerLine />
						<BurgerLine />
					</MenuButton>

					<BrandLink href="/" aria-label="Litreasure home">
						<LogoMark>
							<LogoIcon />
						</LogoMark>
						<BrandText>litreasure</BrandText>
					</BrandLink>

					<OverflowMenu
						id="overflow-navigation"
						aria-hidden={!isMenuOpen}
						$isOpen={isMenuOpen}
						aria-label="Дополнительное меню"
					>
						<OverflowList>
							{overflowItems.map((item) => (
								<OverflowMenuItem
									key={item}
									type="button"
									$isActive={item === "Авторы"}
									onClick={closeMenu}
								>
									{item}
								</OverflowMenuItem>
							))}
						</OverflowList>
					</OverflowMenu>
				</LogoMenuContainer>

				<DesktopNav id="main-navigation" aria-label="Main navigation">
					{navItems.map((item) => (
						<NavButton key={item}>{item}</NavButton>
					))}
				</DesktopNav>

				<SearchWrap>
					<SearchIcon aria-hidden="true" />
					<HeaderSearch
						type="search"
						placeholder="Название, автор"
						aria-label="Поиск книг"
					/>
				</SearchWrap>

				<AuthActions>
					<AuthButton variant="text">Регистрация</AuthButton>
					<AuthButton variant="contained">Вход</AuthButton>
				</AuthActions>
			</HeaderToolbar>
		</HeaderBar>
	);
};

export default Header;

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
		gap: 2.5rem;
		padding: 0 3.75rem;

		@media (max-width: 56.25rem) {
			gap: 1rem;
		}

		@media (max-width: 40rem) {
			min-height: 4.625rem;
			flex-wrap: wrap;
			align-content: center;
			gap: 0.75rem;
			padding-block: 0.75rem;
		}
	}
`;

const LogoMenuContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const MenuButton = styled(IconButton)`
	&& {
		display: inline-flex;
		width: 2.75rem;
		height: 2.75rem;
		flex-shrink: 0;
		flex-direction: column;
		gap: 0.3125rem;
		color: ${theme.colors.lightText};
	}
`;

const BurgerLine = styled.span`
	width: 20px;
	height: 2px;
	border-radius: 999px;
	background: ${theme.colors.greyWarm};
`;

const BrandLink = styled.a`
	display: flex;
	align-items: center;
	flex-shrink: 0;
	gap: 12px;
	color: inherit;
	text-decoration: none;
`;

const LogoMark = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;

	& svg {
		width: 68px;
		height: 68px;
	}
`;

const BrandText = styled.div`
	padding-top: 4px;
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

const SearchWrap = styled.label`
	position: relative;
	display: flex;
	width: min(270px, 30vw);
	margin-left: auto;
	align-items: center;

	@media (max-width: 720px) {
		order: 5;
		width: 100%;
		margin-left: 0;
	}
`;

const SearchIcon = styled.span`
	position: absolute;
	left: 14px;
	bottom: 55%;
	width: 14px;
	height: 14px;
	border: 2px solid currentColor;
	border-radius: 50%;
	color: ${theme.colors.softForeground};
	pointer-events: none;
	transform: translateY(50%);

	&::after {
		position: absolute;
		right: -6px;
		bottom: -4px;
		width: 8px;
		height: 2px;
		border-radius: 999px;
		background: currentColor;
		content: "";
		transform: rotate(45deg);
	}
`;

const HeaderSearch = styled(InputField)`
	min-height: 34px;
	padding-left: 42px;
`;

const AuthActions = styled(Box)`
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

const OverflowMenu = styled.nav<{ $isOpen: boolean }>`
	position: absolute;
	z-index: -1;
	top: 0;
	left: clamp(16px, 4vw, 48px);
	width: min(300px, 90vw);
	height: fit-content;
	border-radius: 0 0 16px 16px;
	background: ${theme.colors.bluePrimary};
	box-shadow: 0 0 10px ${theme.alpha.shadow};
	opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
	padding: 80px 24px 24px;
	pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
	transform: translateY(${({ $isOpen }) => ($isOpen ? "0" : "-16px")});
	transition:
		opacity 180ms ease,
		transform 220ms ease;

	@media (max-width: 520px) {
		left: 0;
		width: 100%;
		min-height: 420px;
		padding-inline: 32px;
	}
`;

const OverflowList = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 24px;
`;

const OverflowMenuItem = styled.button<{ $isActive?: boolean }>`
	width: 100%;
	border: 0;
	background: ${theme.colors.transparent};
	padding: 0;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeLight : theme.colors.background};
	font-family: ${theme.fonts.sans};
	font-size: 18px;
	font-weight: 400;
	line-height: 22px;
	text-align: left;
	cursor: pointer;
	transition: color 180ms ease;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeLight};
		outline: none;
	}
`;
