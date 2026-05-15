"use client";

import styled from "styled-components";

import { theme } from "@/shared/theme";
import { BookOfTheWeekSlider } from "@/shared/ui/BookOfTheWeekSlider";
import { BookSliderSection } from "@/shared/ui/BookSliderSection";
import { GenreCarousel } from "@/shared/ui/GenreCarousel";

const HomePage = () => {
	return (
		<Page>
			<CatalogHero>
				<CatalogHeroInner>
					<HeroCopy>
						<PageKicker>Litreasure</PageKicker>
						<PageTitle>Книжная лента</PageTitle>
					</HeroCopy>
					<HeroText>
						«Читатель проживает тысячу жизней до того, как умрет. Тот, кто
						никогда не читает, — только одну» — Джордж Мартин.
					</HeroText>
				</CatalogHeroInner>
			</CatalogHero>

			<GenreCarousel />

			<BookSliderSection title="Популярное" sort="popular" limit={20} />
			<BookOfTheWeekSlider />
			<BookSliderSection
				title="Young Adult Fiction"
				sort="newest"
				genre="young_adult_fiction"
				limit={20}
			/>
			<BookSliderSection
				title="Fantasy"
				sort="newest"
				genre="fantasy"
				limit={20}
			/>
		</Page>
	);
};

export default HomePage;

const Page = styled.div`
	min-height: 100dvh;
	overflow-x: clip;
	background:
		radial-gradient(
			circle at top left,
			${theme.alpha.orangeGlow},
			${theme.colors.transparent} 28%
		),
		linear-gradient(
			180deg,
			${theme.colors.backgroundTop} 0%,
			${theme.colors.background} 100%
		);
	padding-bottom: clamp(3rem, 5vw, 4.5rem);
`;

const CatalogHero = styled.section`
	background:
		radial-gradient(
			circle at 76% 18%,
			${theme.alpha.orangeGlow},
			${theme.colors.transparent} 28%
		),
		linear-gradient(
			135deg,
			${theme.colors.bluePrimary} 0%,
			${theme.colors.foreground} 100%
		);
`;

const CatalogHeroInner = styled.div`
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(18rem, 26rem);
	align-items: center;
	gap: clamp(2rem, 5vw, 4rem);
	width: min(
		calc(100% - (${theme.layout.contentGutter} * 2)),
		${theme.layout.contentMaxWidth}
	);
	margin: 0 auto;
	padding: clamp(2.25rem, 4.5vw, 4rem) 0 clamp(2.5rem, 4.5vw, 3.5rem);

	@media (max-width: 64rem) {
		gap: 2rem;
	}

	@media (max-width: 48rem) {
		grid-template-columns: 1fr;
		gap: 1.25rem;
		padding-bottom: 3.5rem;
	}
`;

const HeroCopy = styled.div`
	min-width: 0;
`;

const PageKicker = styled.p`
	margin: 0 0 0.75rem;
	color: ${theme.colors.orangePrimary};
	font-family: ${theme.fonts.sans};
	font-size: 0.8125rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	line-height: 1.2;
	text-transform: uppercase;
`;

const PageTitle = styled.h1`
	margin: 0;
	color: ${theme.colors.invertedText};
	font-family: ${theme.fonts.serif};
	font-size: clamp(3rem, 5vw, 4.5rem);
	font-weight: 600;
	line-height: 0.96;
`;

const HeroText = styled.p`
	max-width: 28rem;
	margin: 0;
	color: ${theme.colors.invertedText};
	font-family: ${theme.fonts.sans};
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.55;
	opacity: 0.82;
`;
