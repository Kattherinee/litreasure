"use client";

import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { CropperRef } from "react-advanced-cropper";
import { Cropper } from "react-advanced-cropper";
import styled from "styled-components";

import {
	type IBook,
	type ICreateBookPayload,
	useCreateBookMutation,
} from "@/shared/api/books";
import { useGenresQuery } from "@/shared/api/genres";
import { useUploadImageMutation } from "@/shared/api/images";
import { theme } from "@/shared/theme";
import { Button } from "@/shared/ui/Button";

interface ICreateBookModalProps {
	onClose: () => void;
	onCreated?: (book: IBook) => void;
}

type ICreateBookFormState = {
	author: string;
	coverUrl: string;
	description: string;
	genreInput: string;
	genres: string[];
	language: string;
	pagesCount: string;
	publishedYear: string;
	publisher: string;
	rating: number;
	title: string;
};

type ICoverCropState = {
	file: File;
	height: number;
	width: number;
};

const bookCoverRules = {
	allowedMaxRatio: 0.86,
	allowedMinHeight: 750,
	allowedMinRatio: 0.56,
	allowedMinWidth: 500,
	idealHeight: 1500,
	idealRatio: 2 / 3,
	idealWidth: 1000,
};

const createDefaultBookForm = (): ICreateBookFormState => ({
	author: "",
	coverUrl: "",
	description: "",
	genreInput: "",
	genres: [],
	language: "",
	pagesCount: "",
	publishedYear: "",
	publisher: "",
	rating: 0,
	title: "",
});

const loadImage = (src: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("Failed to read image."));
		image.src = src;
	});

const readImageSize = async (src: string) => {
	const image = await loadImage(src);

	return {
		height: image.naturalHeight,
		width: image.naturalWidth,
	};
};

const isValidBookCoverSize = (width: number, height: number) => {
	const ratio = width / height;

	return (
		width >= bookCoverRules.allowedMinWidth &&
		height >= bookCoverRules.allowedMinHeight &&
		ratio >= bookCoverRules.allowedMinRatio &&
		ratio <= bookCoverRules.allowedMaxRatio
	);
};

export const CreateBookModal = ({
	onClose,
	onCreated,
}: ICreateBookModalProps) => {
	const createBookMutation = useCreateBookMutation();
	const uploadImageMutation = useUploadImageMutation();
	const { data: genreSuggestionsSource = [] } = useGenresQuery();
	const coverInputRef = useRef<HTMLInputElement | null>(null);
	const coverCropperRef = useRef<CropperRef>(null);
	const [form, setForm] = useState<ICreateBookFormState>(createDefaultBookForm);
	const [error, setError] = useState("");
	const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
	const [coverCrop, setCoverCrop] = useState<ICoverCropState | null>(null);
	const normalizedGenreInput = form.genreInput.trim().toLowerCase();
	const genreSuggestions = genreSuggestionsSource
		.filter((genre) => {
			const isAlreadySelected = form.genres.some(
				(selectedGenre) =>
					selectedGenre.toLowerCase() === genre.name.toLowerCase(),
			);
			if (isAlreadySelected) return false;
			if (!normalizedGenreInput) return true;

			return genre.name.toLowerCase().includes(normalizedGenreInput);
		})
		.slice(0, 6);

	useEffect(() => {
		return () => {
			if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		};
	}, [coverPreviewUrl]);

	const closeModal = () => {
		if (createBookMutation.isPending) return;
		if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		setCoverPreviewUrl("");
		setCoverCrop(null);
		setError("");
		setForm(createDefaultBookForm());
		onClose();
	};

	const updateForm = (
		field: keyof ICreateBookFormState,
		value: ICreateBookFormState[keyof ICreateBookFormState],
	) => {
		setError("");
		setForm((current) => ({ ...current, [field]: value }));
	};

	const addGenre = (rawGenre: string) => {
		const genre = rawGenre.trim();
		const isAlreadySelected = form.genres.some(
			(selectedGenre) => selectedGenre.toLowerCase() === genre.toLowerCase(),
		);
		if (!genre || isAlreadySelected) return;

		setError("");
		setForm((current) => ({
			...current,
			genreInput: "",
			genres: [...current.genres, genre],
		}));
	};

	const removeGenre = (genre: string) => {
		setForm((current) => ({
			...current,
			genres: current.genres.filter((item) => item !== genre),
		}));
	};

	const handleGenreKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			addGenre(form.genreInput);
		}
	};

	const uploadCoverFile = async (file: File, previewUrl?: string) => {
		try {
			const uploadedCover = await uploadImageMutation.mutateAsync({
				file,
				purpose: "book-cover",
			});
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setCoverPreviewUrl("");
			setCoverCrop(null);
			updateForm("coverUrl", uploadedCover.url);
		} catch (caughtError) {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setCoverPreviewUrl("");
			setCoverCrop(null);
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Failed to upload cover.",
			);
		}
	};

	const handleCoverFileChange = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		const nextPreviewUrl = URL.createObjectURL(file);
		setCoverPreviewUrl(nextPreviewUrl);
		setCoverCrop(null);
		setError("");

		try {
			const { height, width } = await readImageSize(nextPreviewUrl);
			if (isValidBookCoverSize(width, height)) {
				await uploadCoverFile(file, nextPreviewUrl);
				return;
			}

			setCoverCrop({ file, height, width });
			updateForm("coverUrl", "");
			setError(
				"Image dimensions are not suitable. Choose a new image or crop this one.",
			);
		} catch (caughtError) {
			URL.revokeObjectURL(nextPreviewUrl);
			setCoverPreviewUrl("");
			setCoverCrop(null);
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Failed to read cover.",
			);
		}
	};

	const handleCropCover = async () => {
		if (!coverCrop || !coverPreviewUrl) return;

		try {
			setError("");
			const canvas = coverCropperRef.current?.getCanvas({
				height: bookCoverRules.idealHeight,
				imageSmoothingQuality: "high",
				width: bookCoverRules.idealWidth,
			});
			if (!canvas) throw new Error("Failed to prepare crop.");

			const blob = await new Promise<Blob | null>((resolve) =>
				canvas.toBlob(resolve, "image/jpeg", 0.92),
			);
			if (!blob) throw new Error("Failed to crop image.");

			const croppedFile = new File([blob], coverCrop.file.name, {
				type: "image/jpeg",
			});
			await uploadCoverFile(croppedFile, coverPreviewUrl);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Failed to crop cover.",
			);
		}
	};

	const clearCover = () => {
		if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		setCoverPreviewUrl("");
		setCoverCrop(null);
		updateForm("coverUrl", "");
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");

		const title = form.title.trim();
		const author = form.author.trim();
		const pendingGenre = form.genreInput.trim();
		const genres = pendingGenre
			? Array.from(new Set([...form.genres, pendingGenre]))
			: form.genres;

		if (!title || !author) {
			setError("Please provide title and author.");
			return;
		}

		const payload: ICreateBookPayload = { author, genres, title };
		const description = form.description.trim();
		const coverUrl = form.coverUrl.trim();
		const publishedYear = Number(form.publishedYear);
		const pagesCount = Number(form.pagesCount);
		const publisher = form.publisher.trim();
		const language = form.language.trim();

		if (description) payload.description = description;
		if (coverUrl) payload.coverUrl = coverUrl;
		if (publisher) payload.publisher = publisher;
		if (language) payload.language = language;
		if (Number.isFinite(pagesCount) && pagesCount > 0) {
			payload.pagesCount = Math.round(pagesCount);
		}
		if (Number.isFinite(publishedYear) && publishedYear > 0) {
			payload.publishedYear = Math.round(publishedYear);
		}
		if (Number.isFinite(form.rating) && form.rating > 0) {
			payload.rating = Math.min(5, Math.max(0, form.rating));
		}

		try {
			const book = await createBookMutation.mutateAsync(payload);
			if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
			setCoverPreviewUrl("");
			setCoverCrop(null);
			setError("");
			setForm(createDefaultBookForm());
			onCreated?.(book);
			onClose();
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Failed to create book.",
			);
		}
	};

	return (
		<Overlay role="presentation" onMouseDown={closeModal}>
			<Dialog
				aria-modal="true"
				role="dialog"
				aria-labelledby="create-book-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<Header>
					<Title id="create-book-title">New book</Title>
					<CloseButton aria-label="Close" type="button" onClick={closeModal}>
						×
					</CloseButton>
				</Header>
				<Body>
					<Form onSubmit={handleSubmit}>
						<Top>
							<CoverColumn>
								<CoverUpload
									$coverUrl={coverPreviewUrl || form.coverUrl || undefined}
									type="button"
									onClick={() => coverInputRef.current?.click()}
								>
									{coverPreviewUrl || form.coverUrl ? null : (
										<CoverUploadPlaceholder>
											<AutoStoriesOutlinedIcon aria-hidden="true" />
											<span>Upload cover</span>
											<CoverUploadHint>
												Best ratio 2:3, minimum 500x750 px
											</CoverUploadHint>
										</CoverUploadPlaceholder>
									)}
								</CoverUpload>
								{coverPreviewUrl || form.coverUrl ? (
									<CoverActions>
										<CoverSmallButton
											type="button"
											onClick={() => coverInputRef.current?.click()}
										>
											{uploadImageMutation.isPending
												? "Uploading..."
												: "Replace"}
										</CoverSmallButton>
										<CoverSmallButton type="button" onClick={clearCover}>
											Remove
										</CoverSmallButton>
									</CoverActions>
								) : null}
							</CoverColumn>
							<HiddenFileInput
								ref={coverInputRef}
								accept="image/*"
								type="file"
								onChange={handleCoverFileChange}
							/>
							<TopFields>
								<FormField>
									<FormLabel $required>Title</FormLabel>
									<FormInput
										required
										value={form.title}
										onChange={(event) =>
											updateForm("title", event.target.value)
										}
									/>
								</FormField>
								<FormField>
									<FormLabel $required>Author</FormLabel>
									<FormInput
										required
										value={form.author}
										onChange={(event) =>
											updateForm("author", event.target.value)
										}
									/>
								</FormField>
								<FormField>
									<FormLabel>Genres</FormLabel>
									<TagInputRow>
										{form.genres.map((genre) => (
											<TagChip key={genre}>
												<span>{genre}</span>
												<TagRemoveButton
													aria-label={`Remove genre ${genre}`}
													type="button"
													onClick={() => removeGenre(genre)}
												>
													×
												</TagRemoveButton>
											</TagChip>
										))}
										<TagInput
											placeholder="For example: fantasy, romance, detective"
											value={form.genreInput}
											onBlur={() => addGenre(form.genreInput)}
											onChange={(event) =>
												updateForm("genreInput", event.target.value)
											}
											onKeyDown={handleGenreKeyDown}
										/>
									</TagInputRow>
									{genreSuggestions.length > 0 || form.genreInput.trim() ? (
										<TagSuggestions>
											{genreSuggestions.map((genre) => (
												<TagSuggestionButton
													key={genre.id}
													type="button"
													onMouseDown={(event) => event.preventDefault()}
													onClick={() => addGenre(genre.name)}
												>
													{genre.name}
												</TagSuggestionButton>
											))}
											{form.genreInput.trim() &&
											!form.genres.some(
												(genre) =>
													genre.toLowerCase() ===
													form.genreInput.trim().toLowerCase(),
											) ? (
												<TagSuggestionButton
													type="button"
													onMouseDown={(event) => event.preventDefault()}
													onClick={() => addGenre(form.genreInput)}
												>
													Add "{form.genreInput.trim()}"
												</TagSuggestionButton>
											) : null}
										</TagSuggestions>
									) : null}
								</FormField>
							</TopFields>
						</Top>
						<FormField>
							<FormLabel>Description</FormLabel>
							<FormTextarea
								rows={4}
								value={form.description}
								onChange={(event) =>
									updateForm("description", event.target.value)
								}
							/>
						</FormField>
						<FormGrid $columns={3}>
							<FormField>
								<FormLabel>Publication year</FormLabel>
								<FormInput
									inputMode="numeric"
									pattern="[0-9]*"
									type="text"
									value={form.publishedYear}
									onChange={(event) =>
										updateForm(
											"publishedYear",
											event.target.value.replace(/\D/g, ""),
										)
									}
								/>
							</FormField>
							<FormField>
								<FormLabel>Pages</FormLabel>
								<FormInput
									inputMode="numeric"
									pattern="[0-9]*"
									type="text"
									value={form.pagesCount}
									onChange={(event) =>
										updateForm(
											"pagesCount",
											event.target.value.replace(/\D/g, ""),
										)
									}
								/>
							</FormField>
							<FormField>
								<FormLabel>Rating</FormLabel>
								<RatingStars>
									{[1, 2, 3, 4, 5].map((star) => {
										const isActive = form.rating >= star;

										return (
											<StarButton
												key={star}
												$isActive={isActive}
												aria-label={`${star} of 5`}
												type="button"
												onClick={() => updateForm("rating", star)}
											>
												{isActive ? (
													<StarIcon aria-hidden="true" />
												) : (
													<StarBorderIcon aria-hidden="true" />
												)}
											</StarButton>
										);
									})}
									{form.rating > 0 ? (
										<ClearRatingButton
											type="button"
											onClick={() => updateForm("rating", 0)}
										>
											Clear
										</ClearRatingButton>
									) : null}
								</RatingStars>
							</FormField>
						</FormGrid>
						<FormGrid>
							<FormField>
								<FormLabel>Publisher</FormLabel>
								<FormInput
									value={form.publisher}
									onChange={(event) =>
										updateForm("publisher", event.target.value)
									}
								/>
							</FormField>
							<FormField>
								<FormLabel>Language</FormLabel>
								<FormInput
									placeholder="For example: English"
									value={form.language}
									onChange={(event) =>
										updateForm("language", event.target.value)
									}
								/>
							</FormField>
						</FormGrid>
						{error ? <FormError role="alert">{error}</FormError> : null}
						<Actions>
							<CancelButton
								buttonType="outlined"
								disabled={createBookMutation.isPending}
								type="button"
								onClick={closeModal}
							>
								Cancel
							</CancelButton>
							<Button
								buttonType="containedInverted"
								disabled={createBookMutation.isPending}
								type="submit"
							>
								{createBookMutation.isPending ? "Creating..." : "Create book"}
							</Button>
						</Actions>
					</Form>
				</Body>
			</Dialog>
			{coverCrop && coverPreviewUrl ? (
				<CropOverlay
					role="presentation"
					onMouseDown={(event) => event.stopPropagation()}
				>
					<CropModal
						aria-label="Crop cover"
						aria-modal="true"
						role="dialog"
						onMouseDown={(event) => event.stopPropagation()}
					>
						<CropMessage>
							Image dimensions are not suitable. Choose a new one or crop it to
							a 2:3 ratio.
						</CropMessage>
						<CropperShell>
							<StyledCropper
								ref={coverCropperRef}
								src={coverPreviewUrl}
								stencilProps={{ aspectRatio: bookCoverRules.idealRatio }}
							/>
						</CropperShell>
						<CropMeta>
							Original size: {coverCrop.width}x{coverCrop.height} px. After
							cropping, the cover will be uploaded as 1000x1500 px.
						</CropMeta>
						<CropActions>
							<CoverSmallButton
								type="button"
								onClick={() => coverInputRef.current?.click()}
							>
								Choose another image
							</CoverSmallButton>
							<CoverSmallButton type="button" onClick={handleCropCover}>
								Crop and upload
							</CoverSmallButton>
						</CropActions>
					</CropModal>
				</CropOverlay>
			) : null}
		</Overlay>
	);
};

const Overlay = styled.div`
	position: fixed;
	z-index: 1400;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.48);
	padding: 1rem;
`;

const Dialog = styled.section`
	display: flex;
	width: min(100%, 44rem);
	max-height: min(100%, calc(100dvh - 4rem));
	flex-direction: column;
	overflow: hidden;
	border: 0.0625rem solid rgb(238 179 141 / 0.62);
	border-radius: 1.1rem;
	background: ${theme.colors.background};
	padding: 1.25rem;
	box-shadow: 0 1.25rem 3rem rgb(4 18 26 / 0.18);
`;

const Body = styled.div`
	min-height: 0;
	overflow-x: hidden;
	overflow-y: auto;
	padding-right: 0.45rem;
	scrollbar-color: rgb(185 174 167 / 0.68) transparent;
	scrollbar-width: thin;

	&::-webkit-scrollbar {
		width: 0.38rem;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
		margin: 0.4rem 0;
	}

	&::-webkit-scrollbar-thumb {
		border-radius: 999px;
		background: rgb(185 174 167 / 0.68);
	}
`;

const Header = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const Title = styled.h2`
	margin: 0;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.65rem;
	font-weight: 600;
	line-height: 1.15;
`;

const CloseButton = styled.button`
	border: 0;
	background: transparent;
	color: ${theme.colors.softForeground};
	cursor: pointer;
	font: inherit;
	font-size: 1.6rem;
	line-height: 1;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const Form = styled.form`
	display: grid;
	gap: 0.85rem;
`;

const Top = styled.div`
	display: grid;
	align-items: start;
	gap: 1rem;
	grid-template-columns: 11rem minmax(0, 1fr);

	@media (max-width: 38rem) {
		grid-template-columns: 1fr;
	}
`;

const CoverColumn = styled.div`
	display: grid;
	gap: 0.65rem;
	justify-items: center;
`;

const CoverUpload = styled.button<{ $coverUrl?: string }>`
	position: relative;
	display: grid;
	width: 11rem;
	aspect-ratio: 2 / 3;
	place-items: center;
	overflow: hidden;
	border: 0.0625rem dashed
		${({ $coverUrl }) => ($coverUrl ? "transparent" : "rgb(218 142 91 / 0.62)")};
	border-radius: 0.8rem;
	background:
		linear-gradient(
			rgb(4 18 26 / ${({ $coverUrl }) => ($coverUrl ? "0.12" : "0.06")}),
			rgb(4 18 26 / ${({ $coverUrl }) => ($coverUrl ? "0.12" : "0.06")})
		),
		${({ $coverUrl }) =>
			$coverUrl
				? `url("${$coverUrl}") center / cover no-repeat`
				: "rgb(242 239 237 / 0.72)"};
	color: ${theme.colors.softForeground};
	cursor: pointer;
	font: inherit;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		outline: none;
	}
`;

const CoverUploadPlaceholder = styled.span`
	display: grid;
	justify-items: center;
	gap: 0.45rem;
	padding: 0.8rem;
	font-size: 0.82rem;
	font-weight: 700;
	text-align: center;

	& svg {
		width: 2rem;
		height: 2rem;
		color: ${theme.colors.orangeDark};
	}
`;

const CoverUploadHint = styled.small`
	color: ${theme.colors.muted};
	font-size: 0.72rem;
	font-weight: 600;
	line-height: 1.2;
`;

const HiddenFileInput = styled.input`
	display: none;
`;

const TopFields = styled.div`
	display: grid;
	gap: 0.75rem;
`;

const CoverActions = styled.div`
	display: flex;
	flex-wrap: nowrap;
	justify-content: center;
	gap: 0.45rem;
`;

const CoverSmallButton = styled.button`
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 999px;
	background: rgb(242 239 237 / 0.74);
	padding: 0.35rem 0.7rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.76rem;
	font-weight: 700;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const FormGrid = styled.div<{ $columns?: number }>`
	display: grid;
	gap: 0.75rem;
	grid-template-columns: repeat(
		${({ $columns = 2 }) => $columns},
		minmax(0, 1fr)
	);

	@media (max-width: 48rem) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 36rem) {
		grid-template-columns: 1fr;
	}
`;

const FormField = styled.label`
	display: grid;
	gap: 0.35rem;
`;

const FormLabel = styled.span<{ $required?: boolean }>`
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	font-weight: 700;

	&::after {
		content: ${({ $required }) => ($required ? '" *"' : '""')};
		color: ${theme.colors.orangeDark};
	}
`;

const fieldStyles = `
	width: 100%;
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 0.85rem;
	background: rgb(242 239 237 / 0.74);
	padding: 0.72rem 0.8rem;
	color: ${theme.colors.foreground};
	font: inherit;
	font-size: 0.95rem;
	outline: none;
	transition:
		background-color 150ms,
		border-color 150ms,
		box-shadow 150ms;

	&:hover {
		border-color: rgb(218 142 91 / 0.45);
		background: rgb(242 239 237 / 0.92);
	}

	&:focus,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		box-shadow: 0 0 0 0.15rem rgb(218 142 91 / 0.14);
	}
`;

const FormInput = styled.input`
	${fieldStyles}
`;

const FormTextarea = styled.textarea`
	${fieldStyles}
	resize: vertical;
`;

const TagInputRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem;
	min-height: 2.75rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 0.85rem;
	background: rgb(242 239 237 / 0.74);
	padding: 0.45rem;
`;

const TagChip = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.28);
	border-radius: 999px;
	background: rgb(218 142 91 / 0.12);
	padding: 0.28rem 0.42rem 0.28rem 0.62rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.82rem;
	font-weight: 700;
`;

const TagRemoveButton = styled.button`
	display: inline-grid;
	width: 1.15rem;
	height: 1.15rem;
	place-items: center;
	border: 0;
	border-radius: 50%;
	background: rgb(255 255 255 / 0.58);
	color: inherit;
	cursor: pointer;
	font: inherit;
	line-height: 1;

	&:hover,
	&:focus-visible {
		background: ${theme.colors.bluePrimary};
		color: ${theme.colors.invertedText};
		outline: none;
	}
`;

const TagInput = styled.input`
	min-width: 8rem;
	flex: 1 1 8rem;
	border: 0;
	background: transparent;
	color: ${theme.colors.foreground};
	font: inherit;
	outline: none;
	padding: 0.28rem;
`;

const TagSuggestions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
`;

const TagSuggestionButton = styled.button`
	border: 0.0625rem solid rgb(218 142 91 / 0.3);
	border-radius: 999px;
	background: rgb(242 239 237 / 0.82);
	padding: 0.28rem 0.65rem;
	color: ${theme.colors.softForeground};
	cursor: pointer;
	font: inherit;
	font-size: 0.78rem;
	font-weight: 700;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		background: rgb(218 142 91 / 0.12);
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const RatingStars = styled.div`
	display: flex;
	align-items: center;
	gap: 0.2rem;
	min-height: 2.75rem;
`;

const StarButton = styled.button<{ $isActive: boolean }>`
	display: inline-grid;
	width: 2rem;
	height: 2rem;
	place-items: center;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeLight : theme.colors.muted};
	cursor: pointer;
	padding: 0;

	& svg {
		width: 1.45rem;
		height: 1.45rem;
	}

	&:hover,
	&:focus-visible {
		background: rgb(218 142 91 / 0.12);
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const ClearRatingButton = styled.button`
	border: 0;
	background: transparent;
	color: ${theme.colors.softForeground};
	cursor: pointer;
	font: inherit;
	font-size: 0.75rem;

	&:hover,
	&:focus-visible {
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const FormError = styled.p`
	margin: 0;
	color: #a03434;
	font-size: 0.86rem;
	font-weight: 700;
`;

const Actions = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 0.65rem;
	margin-top: 0.2rem;
`;

const CancelButton = styled(Button)``;

const CropOverlay = styled.div`
	position: fixed;
	z-index: 1410;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.48);
	padding: 1rem;
`;

const CropModal = styled.section`
	display: grid;
	width: min(100%, 32rem);
	gap: 0.75rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.42);
	border-radius: 1rem;
	background: ${theme.colors.background};
	padding: 1rem;
	box-shadow: 0 1.25rem 3rem rgb(4 18 26 / 0.2);
`;

const CropMessage = styled.p`
	margin: 0;
	color: ${theme.colors.orangeDark};
	font-size: 0.84rem;
	font-weight: 700;
	line-height: 1.35;
`;

const CropperShell = styled.div`
	height: 21rem;
	overflow: hidden;
	border: 0.0625rem solid rgb(218 142 91 / 0.2);
	border-radius: 0.85rem;
	background: rgb(242 239 237 / 0.72);
`;

const StyledCropper = styled(Cropper)`
	width: 100%;
	height: 100%;
`;

const CropMeta = styled.p`
	margin: 0;
	color: ${theme.colors.softForeground};
	font-size: 0.78rem;
	line-height: 1.35;
`;

const CropActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.45rem;
`;
