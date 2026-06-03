"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

import { PaperBooksSection } from "@/components/pages/paper-books/PaperBooksSection";
import { useAuthStore } from "@/shared/store/auth-store";
import { theme } from "@/shared/theme";

const MyPaperBooksPage = () => {
	const router = useRouter();
	const session = useAuthStore((state) => state.session);

	useEffect(() => {
		if (!session) {
			router.replace("/?auth=required");
		}
	}, [router, session]);

	if (!session) {
		return null;
	}

	return (
		<Page>
			<Hero>
				<HeroInner>
					<HeroCopy>
						<PageTitle>My paper books</PageTitle>
						<HeroText>
							Track owned copies, books you want to buy, and books you have
							given away, with notes attached to each card.
						</HeroText>
					</HeroCopy>
				</HeroInner>
			</Hero>
			<Content>
				<PaperBooksSection variant="page" />
			</Content>
		</Page>
	);
};

export default MyPaperBooksPage;

const Page = styled.div`
	min-height: 100dvh;
	background: ${theme.colors.background};
	padding-bottom: 4rem;
`;

const Hero = styled.section`
	background: url("/images/TitleBlock.svg") center / cover no-repeat;
`;

const HeroInner = styled.div`
	display: flex;
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.contentMaxWidth}
	);
	align-items: flex-end;
	justify-content: space-between;
	gap: 1rem;
	margin: 0 auto;
	padding: 4vw 0 1.25rem;

	@media (max-width: 42rem) {
		width: calc(100% - 2rem);
		flex-direction: column;
		align-items: flex-start;
	}
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const PageTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 2.5vw;
	font-weight: 600;
	line-height: 0.98;

	@media (max-width: 48rem) {
		font-size: 2.5rem;
	}
`;

const HeroText = styled.p`
	max-width: 43rem;
	margin: 1rem 0 0;
	color: ${theme.colors.softForeground};
	font-size: 1.05rem;
	line-height: 1.6;
`;

const Content = styled.section`
	padding-top: clamp(2rem, 4vw, 3.25rem);
`;
