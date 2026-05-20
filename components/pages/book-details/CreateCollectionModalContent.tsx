"use client";

import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/Public";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CropperRef } from "react-advanced-cropper";
import { CircleStencil, Cropper } from "react-advanced-cropper";
import { createPortal } from "react-dom";
import styled from "styled-components";

import {
	type ICollectionPreview,
	useCollectionTagsQuery,
	useCreateCollectionMutation,
} from "@/shared/api/collections";
import { useUploadImageMutation } from "@/shared/api/images";
import { theme } from "@/shared/theme";

const COLLECTION_COVER_SIZE = 512;

interface ICreateCollectionModalContentProps {
	bookId?: string;
	collectionIds?: Set<string>;
	collections: ICollectionPreview[];
	onBack: () => void;
	onCollectionIdsChange?: (ids: Set<string>) => void;
	onMessage: (message: string) => void;
}

export const CreateCollectionModalContent = ({
	bookId,
	collectionIds,
	collections,
	onBack,
	onCollectionIdsChange,
	onMessage,
}: ICreateCollectionModalContentProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cropperRef = useRef<CropperRef>(null);
	const createCollectionMutation = useCreateCollectionMutation();
	const uploadImageMutation = useUploadImageMutation();
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newCoverUrl, setNewCoverUrl] = useState("");
	const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
	const [isCoverCropOpen, setIsCoverCropOpen] = useState(false);
	const [newTagsInput, setNewTagsInput] = useState("");
	const [newTags, setNewTags] = useState<string[]>([]);
	const [isNewCollectionPublic, setIsNewCollectionPublic] = useState(false);
	const normalizedTagSearch = newTagsInput.trim();
	const { data: tagSuggestions = [] } = useCollectionTagsQuery(
		normalizedTagSearch,
		10,
	);
	const isSaving =
		createCollectionMutation.isPending || uploadImageMutation.isPending;
	const suggestedTags = useMemo(
		() => {
			const apiTags = tagSuggestions.map((tag) => tag.label);
			const fallbackTags = collections.flatMap((collection) => collection.tags ?? []);

			return Array.from(new Set([...apiTags, ...fallbackTags])).filter((tag) =>
				normalizedTagSearch
					? tag.toLowerCase().includes(normalizedTagSearch.toLowerCase()) &&
						!newTags.includes(tag)
					: !newTags.includes(tag),
			);
		},
		[collections, newTags, normalizedTagSearch, tagSuggestions],
	);

	useEffect(() => {
		return () => {
			if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		};
	}, [coverPreviewUrl]);

	const openCoverDialog = () => {
		fileInputRef.current?.click();
	};

	const handleCoverFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		setCoverPreviewUrl(URL.createObjectURL(file));
		setNewCoverUrl("");
		setIsCoverCropOpen(true);
		onMessage("");
	};

	const clearCover = () => {
		if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		setCoverPreviewUrl("");
		setNewCoverUrl("");
		setIsCoverCropOpen(false);
	};

	const cancelCoverCrop = () => {
		if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
		setCoverPreviewUrl("");
		setIsCoverCropOpen(false);
	};

	const applyCoverCrop = async () => {
		try {
			const blob = await getCroppedCoverBlob(cropperRef.current);
			const uploadedCover = await uploadImageMutation.mutateAsync({
				file: blob,
				purpose: "collection-cover",
			});
			if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
			setCoverPreviewUrl("");
			setNewCoverUrl(uploadedCover.url);
			setIsCoverCropOpen(false);
			onMessage("");
		} catch (error) {
			onMessage(
				error instanceof Error ? error.message : "Could not prepare cover",
			);
		}
	};

	const addTag = (rawTag: string) => {
		const tag = rawTag.trim();
		if (!tag || newTags.includes(tag)) return;

		setNewTags((current) => [...current, tag]);
		setNewTagsInput("");
	};

	const removeTag = (tag: string) => {
		setNewTags((current) => current.filter((item) => item !== tag));
	};

	const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			addTag(newTagsInput);
		}
	};

	const createCollection = async () => {
		onMessage("");
		const title = newTitle.trim();

		if (!title) {
			onMessage("Collection name is required");
			return;
		}

		try {
			const created = await createCollectionMutation.mutateAsync({
				bookIds: bookId ? [bookId] : undefined,
				coverUrl: newCoverUrl.trim() || undefined,
				description: newDescription.trim() || undefined,
				isPublic: isNewCollectionPublic,
				tags: newTags,
				title,
			});
			if (bookId && collectionIds && onCollectionIdsChange) {
				const nextIds = new Set(collectionIds);
				nextIds.add(created.id);
				onCollectionIdsChange(nextIds);
			}
			onMessage("Collection created");
			onBack();
		} catch (error) {
			onMessage(
				error instanceof Error ? error.message : "Could not create collection",
			);
		}
	};

	return (
		<>
			<CreateCollectionForm onSubmit={(event) => event.preventDefault()}>
				<CollectionCoverEditor
					$coverUrl={coverPreviewUrl || newCoverUrl || undefined}
				>
					{coverPreviewUrl || newCoverUrl ? null : (
						<CoverPlaceholder>
							<AutoStoriesOutlinedIcon aria-hidden="true" />
							<CoverPlaceholderTitle>
								Add a cover for the collection
							</CoverPlaceholderTitle>
							<CoverChoiceRow>
								<CoverControlButton type="button" onClick={openCoverDialog}>
									Upload
								</CoverControlButton>
								<CoverControlButton
									type="button"
									onClick={() => {
										const value = window.prompt("Cover image URL");
										if (value !== null) setNewCoverUrl(value.trim());
									}}
								>
									Use URL
								</CoverControlButton>
							</CoverChoiceRow>
						</CoverPlaceholder>
					)}
					{coverPreviewUrl || newCoverUrl ? (
						<CoverControls>
							<CoverControlButton type="button" onClick={openCoverDialog}>
								Change cover
							</CoverControlButton>
							<CoverControlButton type="button" onClick={clearCover}>
								Remove
							</CoverControlButton>
						</CoverControls>
					) : null}
				</CollectionCoverEditor>
				<HiddenFileInput
					ref={fileInputRef}
					accept="image/*"
					type="file"
					onChange={handleCoverFileChange}
				/>
				<NewCollectionFields>
					<NewCollectionTitleInput
						aria-label="Collection name"
						placeholder="Name of the collection"
						value={newTitle}
						onChange={(event) => setNewTitle(event.target.value)}
					/>
					<TagField>
						<span>Add tags</span>
						<TagInputRow>
							{newTags.map((tag) => (
								<TagChip key={tag}>
									<span>{tag}</span>
									<TagRemoveButton
										aria-label={`Remove tag ${tag}`}
										type="button"
										onClick={() => removeTag(tag)}
									>
										x
									</TagRemoveButton>
								</TagChip>
							))}
							<TagInput
								placeholder="Start typing"
								value={newTagsInput}
								onChange={(event) => setNewTagsInput(event.target.value)}
								onKeyDown={handleTagKeyDown}
							/>
						</TagInputRow>
						{suggestedTags.length > 0 || newTagsInput.trim() ? (
							<TagSuggestions>
								{suggestedTags.slice(0, 5).map((tag) => (
									<TagSuggestionButton
										key={tag}
										type="button"
										onClick={() => addTag(tag)}
									>
										{tag}
									</TagSuggestionButton>
								))}
								{newTagsInput.trim() && !newTags.includes(newTagsInput.trim()) ? (
									<TagSuggestionButton
										type="button"
										onClick={() => addTag(newTagsInput)}
									>
										Add &quot;{newTagsInput.trim()}&quot;
									</TagSuggestionButton>
								) : null}
							</TagSuggestions>
						) : null}
					</TagField>
					<NewCollectionField>
						<span>Description</span>
						<textarea
							placeholder="A few words about your collection"
							value={newDescription}
							onChange={(event) => setNewDescription(event.target.value)}
						/>
					</NewCollectionField>
					<VisibilityToggle>
						<VisibilityOption
							$isActive={!isNewCollectionPublic}
							type="button"
							onClick={() => setIsNewCollectionPublic(false)}
						>
							<LockOutlinedIcon aria-hidden="true" />
							Private
						</VisibilityOption>
						<VisibilityOption
							$isActive={isNewCollectionPublic}
							type="button"
							onClick={() => setIsNewCollectionPublic(true)}
						>
							<PublicIcon aria-hidden="true" />
							Public
						</VisibilityOption>
					</VisibilityToggle>
					<CreateActions>
						<CreateSecondaryButton type="button" onClick={onBack}>
							Back
						</CreateSecondaryButton>
						<CreatePrimaryButton
							disabled={isSaving}
							type="button"
							onClick={() => void createCollection()}
						>
							Create collection
						</CreatePrimaryButton>
					</CreateActions>
				</NewCollectionFields>
			</CreateCollectionForm>
			{typeof document !== "undefined" && coverPreviewUrl && isCoverCropOpen
				? createPortal(
						<CropModalOverlay role="presentation" onMouseDown={cancelCoverCrop}>
							<CropModal
								aria-modal="true"
								role="dialog"
								aria-label="Crop collection cover"
								onMouseDown={(event) => event.stopPropagation()}
							>
								<CropModalTitle>Crop cover</CropModalTitle>
								<CropperShell>
									<StyledCropper
										ref={cropperRef}
										src={coverPreviewUrl}
										stencilComponent={CircleStencil}
									/>
								</CropperShell>
									<CropModalActions>
										<CreateSecondaryButton type="button" onClick={cancelCoverCrop}>
											Cancel
										</CreateSecondaryButton>
										<CreatePrimaryButton
											disabled={uploadImageMutation.isPending}
											type="button"
											onClick={applyCoverCrop}
										>
											{uploadImageMutation.isPending ? "Uploading..." : "Apply"}
										</CreatePrimaryButton>
									</CropModalActions>
							</CropModal>
						</CropModalOverlay>,
						document.body,
					)
				: null}
		</>
	);
};

const getCroppedCoverBlob = async (cropper: CropperRef | null) => {
	const sourceCanvas = cropper?.getCanvas({
		height: COLLECTION_COVER_SIZE,
		imageSmoothingQuality: "high",
		width: COLLECTION_COVER_SIZE,
	});
	if (!sourceCanvas) throw new Error("Could not prepare cover");

	const canvas = document.createElement("canvas");
	canvas.width = COLLECTION_COVER_SIZE;
	canvas.height = COLLECTION_COVER_SIZE;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Could not prepare cover");

	context.clearRect(0, 0, COLLECTION_COVER_SIZE, COLLECTION_COVER_SIZE);
	context.save();
	context.beginPath();
	context.arc(
		COLLECTION_COVER_SIZE / 2,
		COLLECTION_COVER_SIZE / 2,
		COLLECTION_COVER_SIZE / 2,
		0,
		Math.PI * 2,
	);
	context.clip();
	context.drawImage(sourceCanvas, 0, 0);
	context.restore();

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Could not prepare cover"));
			},
			"image/webp",
			0.92,
		);
	});
};

const CreateCollectionForm = styled.form`
	display: grid;
	gap: 1.25rem;
`;

const CollectionCoverEditor = styled.div<{ $coverUrl?: string }>`
	position: relative;
	display: flex;
	min-height: 8.5rem;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	border: 0.0625rem dashed
		${({ $coverUrl }) =>
			$coverUrl ? "transparent" : "rgb(218 142 91 / 0.62)"};
	border-radius: 0.65rem;
	background:
		linear-gradient(
			rgb(4 18 26 / ${({ $coverUrl }) => ($coverUrl ? "0.32" : "0.08")}),
			rgb(4 18 26 / ${({ $coverUrl }) => ($coverUrl ? "0.32" : "0.08")})
		),
		${({ $coverUrl }) =>
			$coverUrl
				? `url("${$coverUrl}") center / cover no-repeat`
				: "rgb(242 239 237 / 0.72)"};

	&:hover > div,
	&:focus-within > div {
		opacity: 1;
	}
`;

const CoverPlaceholder = styled.div`
	position: absolute;
	inset: 0.8rem;
	display: grid;
	place-items: center;
	align-content: center;
	gap: 0.55rem;
	border-radius: 0.5rem;
	background: rgb(255 255 255 / 0.46);
	color: ${theme.colors.softForeground};
	font-family: ${theme.fonts.sans};
	font-size: 0.9rem;
	font-weight: 700;
	text-align: center;

	& svg {
		width: 1.7rem;
		height: 1.7rem;
		color: ${theme.colors.orangeDark};
	}
`;

const CoverPlaceholderTitle = styled.span`
	color: ${theme.colors.softForeground};
	font-size: 1rem;
	line-height: 1.2;
`;

const CoverChoiceRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.55rem;
`;

const CoverControls = styled.div`
	position: relative;
	z-index: 1;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.7rem;
	opacity: 1;
	transition: opacity 160ms ease;

	@media (hover: hover) {
		opacity: 0;
	}
`;

const CoverControlButton = styled.button`
	border: 0;
	border-radius: 999px;
	background: rgb(242 239 237 / 0.9);
	padding: 0.45rem 0.75rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.78rem;
	font-weight: 700;

	&:hover,
	&:focus-visible {
		background: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
	}
`;

const HiddenFileInput = styled.input`
	position: absolute;
	width: 0.0625rem;
	height: 0.0625rem;
	overflow: hidden;
	clip: rect(0 0 0 0);
	white-space: nowrap;
`;

const CropperShell = styled.div`
	width: min(100%, 24rem);
	aspect-ratio: 1 / 1;
	overflow: hidden;
	border: 0.0625rem solid rgb(212 100 28 / 0.18);
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.7);
`;

const StyledCropper = styled(Cropper)`
	width: 100%;
	height: 100%;
`;

const CropModalOverlay = styled.div`
	position: fixed;
	z-index: 90;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.52);
	padding: 1rem;
`;

const CropModal = styled.section`
	width: min(100%, 38rem);
	border: 0.0625rem solid #eeb38d;
	border-radius: 1rem;
	background: #e8e2de;
	padding: 1rem;
	box-shadow: 0 1.25rem 3rem rgb(4 18 26 / 0.18);
`;

const CropModalTitle = styled.h3`
	margin: 0 0 0.8rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.25rem;
	line-height: 1.2;
`;

const CropModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	margin-top: 1rem;
`;

const NewCollectionFields = styled.div`
	display: grid;
	gap: 1rem;
	width: min(100%, 30rem);
	margin: 0 auto;
`;

const NewCollectionTitleInput = styled.input`
	width: 100%;
	border: 0;
	background: transparent;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.3rem;
	font-weight: 600;
	line-height: 1.2;

	&:focus {
		outline: none;
	}
`;

const NewCollectionField = styled.label`
	display: grid;
	gap: 0.18rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.sans};
	font-size: 0.88rem;
	font-weight: 700;

	input,
	textarea {
		width: 100%;
		border: 0;
		background: transparent;
		padding: 0;
		color: ${theme.colors.foreground};
		font: inherit;
		font-size: 0.78rem;
		font-weight: 400;
		resize: vertical;
	}

	textarea {
		min-height: 3.5rem;
	}

	input:focus,
	textarea:focus {
		outline: none;
	}
`;

const TagField = styled.div`
	display: grid;
	gap: 0.35rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.sans};
	font-size: 0.88rem;
	font-weight: 700;
`;

const TagInputRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.35rem;
	min-height: 2.25rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 0.75rem;
	background: rgb(255 255 255 / 0.42);
	padding: 0.35rem;
`;

const TagChip = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.3rem;
	border: 0.0625rem solid rgb(218 142 91 / 0.32);
	border-radius: 999px;
	background: rgb(218 142 91 / 0.12);
	padding: 0.28rem 0.35rem 0.28rem 0.6rem;
	color: ${theme.colors.orangeDark};
	font-size: 0.78rem;
	font-weight: 700;
	line-height: 1;
`;

const TagRemoveButton = styled.button`
	display: inline-flex;
	width: 1rem;
	height: 1rem;
	align-items: center;
	justify-content: center;
	border: 0;
	border-radius: 50%;
	background: rgb(212 100 28 / 0.16);
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	line-height: 1;
	padding: 0;

	&:hover,
	&:focus-visible {
		background: rgb(212 100 28 / 0.24);
		outline: none;
	}
`;

const TagInput = styled.input`
	min-width: 8rem;
	flex: 1;
	border: 0;
	background: transparent;
	padding: 0.2rem;
	color: ${theme.colors.foreground};
	font: inherit;
	font-size: 0.78rem;
	font-weight: 400;

	&:focus {
		outline: none;
	}
`;

const TagSuggestions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.35rem;
`;

const TagSuggestionButton = styled.button`
	border: 0.0625rem solid rgb(211 202 196 / 0.72);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.5);
	padding: 0.28rem 0.58rem;
	color: ${theme.colors.softForeground};
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

const VisibilityToggle = styled.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	width: fit-content;
	min-height: 2rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.7);
	border-radius: 0.65rem;
	background: rgb(242 239 237 / 0.58);
	padding: 0.16rem;
`;

const VisibilityOption = styled.button<{ $isActive: boolean }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.35rem;
	border: 0;
	border-radius: 0.5rem;
	background: ${({ $isActive }) =>
		$isActive ? theme.colors.orangeLight : "transparent"};
	padding: 0.38rem 0.62rem;
	color: ${({ $isActive }) =>
		$isActive ? theme.colors.invertedText : theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.76rem;
	font-weight: 700;

	& svg {
		width: 0.9rem;
		height: 0.9rem;
	}

	&:hover,
	&:focus-visible {
		color: ${({ $isActive }) =>
			$isActive ? theme.colors.invertedText : theme.colors.orangeDark};
		outline: none;
	}
`;

const CreateActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 0.65rem;
`;

const CreateSecondaryButton = styled.button`
	border: 0.0625rem solid rgb(186 183 180 / 0.72);
	border-radius: 999px;
	background: transparent;
	padding: 0.55rem 0.95rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-size: 0.85rem;
	font-weight: 700;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const CreatePrimaryButton = styled(CreateSecondaryButton)`
	border-color: ${theme.colors.orangeLight};
	background: ${theme.colors.orangeLight};
	color: ${theme.colors.invertedText};

	&:disabled {
		cursor: wait;
		opacity: 0.68;
	}
`;
