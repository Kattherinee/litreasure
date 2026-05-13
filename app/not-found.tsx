"use client";

import Link from "next/link";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import styled from "styled-components";

import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";

export default function NotFound() {
	return (
		<Page>
			<Content>
				<Code>404</Code>
				<IconWrap aria-hidden="true">
					<SearchOffIcon />
				</IconWrap>
				<Title>Страница не найдена</Title>
				<Text>
					Похоже, эта полка пока пустует. Вернитесь в книжную ленту или
					попробуйте найти другую историю.
				</Text>
				<ActionRow>
					<HomeButton component={Link} href="/">
						На главную
					</HomeButton>
					<LibraryHint>
						<AutoStoriesOutlinedIcon aria-hidden="true" />
						<span>Litreasure</span>
					</LibraryHint>
				</ActionRow>
			</Content>
		</Page>
	);
}

const Page = styled.div`
	min-height: calc(100dvh - 4.5rem);
	background:
		radial-gradient(
			circle at 18% 14%,
			${theme.alpha.orangeGlow},
			${theme.colors.transparent} 28%
		),
		linear-gradient(
			180deg,
			${theme.colors.backgroundTop} 0%,
			${theme.colors.background} 100%
		);
	padding: clamp(3rem, 7vw, 6rem) 1.5rem;
`;

const Content = styled.section`
	position: relative;
	width: min(100%, 44rem);
	margin: 0 auto;
	padding-top: clamp(2rem, 5vw, 4rem);
	color: ${theme.colors.foreground};
`;

const Code = styled.p`
	margin: 0 0 0.75rem;
	color: ${theme.colors.orangeDark};
	font-family: ${theme.fonts.sans};
	font-size: 0.875rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	line-height: 1.2;
	text-transform: uppercase;
`;

const IconWrap = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 4rem;
	height: 4rem;
	margin-bottom: 1.25rem;
	border: 0.0625rem solid ${theme.alpha.blueDivider};
	border-radius: 50%;
	background: ${theme.alpha.surfaceRaised};
	color: ${theme.colors.orangeDark};

	& svg {
		width: 2rem;
		height: 2rem;
	}
`;

const Title = styled.h1`
	max-width: 38rem;
	margin: 0;
	font-family: ${theme.fonts.serif};
	font-size: clamp(3rem, 7vw, 5.5rem);
	font-weight: 600;
	line-height: 0.98;
`;

const Text = styled.p`
	max-width: 34rem;
	margin: 1.25rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.1rem;
	line-height: 1.6;
`;

const ActionRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;
`;

const HomeButton = styled(Button)`
	&& {
		background: ${theme.colors.orangePrimary};
		border-color: ${theme.colors.orangePrimary};
		color: ${theme.colors.white};

		&:hover {
			background: ${theme.colors.bluePrimary};
			border-color: ${theme.colors.bluePrimary};
			color: ${theme.colors.invertedText};
		}
	}
`;

const LibraryHint = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.serif};
	font-size: 1rem;

	& svg {
		width: 1.25rem;
		height: 1.25rem;
		color: ${theme.colors.orangeDark};
	}
`;
