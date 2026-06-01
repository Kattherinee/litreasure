"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import MuiAvatar from "@mui/material/Avatar";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import type { CropperRef } from "react-advanced-cropper";
import { CircleStencil, Cropper } from "react-advanced-cropper";
import { createPortal } from "react-dom";
import styled from "styled-components";

import {
	type IAuthorDetails,
	useCreateAuthorMutation,
} from "@/shared/api/authors";
import { useUploadImageMutation } from "@/shared/api/images";
import { theme } from "@/shared/theme";

interface ICreateAuthorModalProps {
	onClose: () => void;
	onCreated?: (author: IAuthorDetails) => void;
}

const PHOTO_SIZE = 768;

export const CreateAuthorModal = ({
	onClose,
	onCreated,
}: ICreateAuthorModalProps) => {
	const createAuthorMutation = useCreateAuthorMutation();
	const uploadImageMutation = useUploadImageMutation();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cropperRef = useRef<CropperRef>(null);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
	const [photoFile, setPhotoFile] = useState<Blob | null>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const [error, setError] = useState("");

	const isSaving =
		createAuthorMutation.isPending || uploadImageMutation.isPending;

	useEffect(() => {
		return () => {
			if (photoPreviewUrl) {
				URL.revokeObjectURL(photoPreviewUrl);
			}
		};
	}, [photoPreviewUrl]);

	const openFileDialog = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
		const localPreview = URL.createObjectURL(file);
		setPhotoFile(file);
		setPhotoPreviewUrl(localPreview);
		setIsCropOpen(true);
		setError("");
	};

	const cancelCrop = () => {
		if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
		setPhotoPreviewUrl("");
		setPhotoFile(null);
		setIsCropOpen(false);
	};

	const applyCrop = async () => {
		try {
			const croppedBlob = await getCroppedPhotoBlob(cropperRef.current);
			if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
			setPhotoFile(croppedBlob);
			setPhotoPreviewUrl(URL.createObjectURL(croppedBlob));
			setIsCropOpen(false);
			setError("");
		} catch (cropError) {
			setError(
				cropError instanceof Error ? cropError.message : "Failed to crop photo.",
			);
		}
	};

	const handleSubmit = async () => {
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Author name is required.");
			return;
		}

		setError("");
		try {
			let nextPhotoUrl: string | undefined;

			if (photoFile) {
				const uploaded = await uploadImageMutation.mutateAsync({
					file: photoFile,
					purpose: "avatar",
				});
				nextPhotoUrl = uploaded.url;
			}

			const created = await createAuthorMutation.mutateAsync({
				bio: bio.trim() || undefined,
				name: trimmedName,
				photoUrl: nextPhotoUrl,
			});
			onCreated?.(created);
			onClose();
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Could not create author.",
			);
		}
	};

	return (
		<Overlay role="presentation" onMouseDown={onClose}>
			<Dialog
				aria-modal="true"
				role="dialog"
				aria-labelledby="create-author-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<Title id="create-author-title">Create author</Title>
				<CloseButton aria-label="Close" type="button" onClick={onClose}>
					<CloseIcon aria-hidden="true" />
				</CloseButton>
				<Form onSubmit={(event) => event.preventDefault()}>
					<AvatarUploadBlock>
						<PhotoPreview src={photoPreviewUrl || undefined}>
							{photoPreviewUrl ? null : "Photo"}
						</PhotoPreview>
						<UploadButton type="button" onClick={openFileDialog}>
							<CloudUploadIcon aria-hidden="true" />
							<span>Upload photo</span>
						</UploadButton>
						{photoPreviewUrl ? (
							<AvatarSecondaryActions>
								<SecondaryButton type="button" onClick={openFileDialog}>
									Change
								</SecondaryButton>
								<SecondaryButton
									type="button"
									onClick={() => {
										if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
										setPhotoPreviewUrl("");
										setPhotoFile(null);
									}}
								>
									Remove
								</SecondaryButton>
							</AvatarSecondaryActions>
						) : null}
						<HiddenFileInput
							ref={fileInputRef}
							accept="image/*"
							type="file"
							onChange={handleFileChange}
						/>
					</AvatarUploadBlock>

					<Field>
						<span>Name</span>
						<input
							required
							placeholder="Author name"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</Field>
					<Field>
						<span>Bio</span>
						<textarea
							placeholder="A short biography"
							value={bio}
							onChange={(event) => setBio(event.target.value)}
						/>
					</Field>
					{error ? <ErrorText role="alert">{error}</ErrorText> : null}
					<Actions>
						<SecondaryButton type="button" onClick={onClose}>
							Cancel
						</SecondaryButton>
						<PrimaryButton
							disabled={isSaving}
							type="button"
							onClick={handleSubmit}
						>
							{isSaving ? "Creating..." : "Create"}
						</PrimaryButton>
					</Actions>
				</Form>
			</Dialog>

			{typeof document !== "undefined" && photoPreviewUrl && isCropOpen
				? createPortal(
						<CropModalOverlay role="presentation" onMouseDown={cancelCrop}>
							<CropModal
								aria-modal="true"
								role="dialog"
								aria-label="Crop author photo"
								onMouseDown={(event) => event.stopPropagation()}
							>
								<CropModalTitle>Crop photo</CropModalTitle>
								<CropperShell>
									<StyledCropper
										ref={cropperRef}
										src={photoPreviewUrl}
										stencilComponent={CircleStencil}
									/>
								</CropperShell>
								<CropModalActions>
									<SecondaryButton type="button" onClick={cancelCrop}>
										Cancel
									</SecondaryButton>
									<PrimaryButton type="button" onClick={applyCrop}>
										Apply
									</PrimaryButton>
								</CropModalActions>
							</CropModal>
						</CropModalOverlay>,
						document.body,
					)
				: null}
		</Overlay>
	);
};

const getCroppedPhotoBlob = async (cropper: CropperRef | null) => {
	const canvas = cropper?.getCanvas({
		height: PHOTO_SIZE,
		imageSmoothingQuality: "high",
		width: PHOTO_SIZE,
	});
	if (!canvas) throw new Error("Failed to prepare image");

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Failed to prepare image"));
			},
			"image/webp",
			0.92,
		);
	});
};

const Overlay = styled.div`
	position: fixed;
	z-index: 1500;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.52);
	padding: 1rem;
`;

const Dialog = styled.section`
	position: relative;
	width: min(100%, 32rem);
	max-height: min(92dvh, 42rem);
	overflow: auto;
	border: 0.0625rem solid rgb(211 202 196 / 0.88);
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.98);
	padding: 1.35rem;
	box-shadow: 0 1.25rem 3rem rgb(4 18 26 / 0.18);
`;

const Title = styled.h2`
	margin: 0 0 1rem;
	color: ${theme.colors.foreground};
	font-family: ${theme.fonts.serif};
	font-size: 1.5rem;
	line-height: 1.2;
`;

const CloseButton = styled.button`
	position: absolute;
	top: 1rem;
	right: 1rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.66);
	color: ${theme.colors.foreground};
	cursor: pointer;
	transition:
		border-color 160ms ease,
		background 160ms ease,
		color 160ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		background: ${theme.colors.orangeLight};
		color: ${theme.colors.invertedText};
		outline: none;
	}
`;

const Form = styled.form`
	display: grid;
	gap: 1rem;
`;

const AvatarUploadBlock = styled.div`
	display: grid;
	justify-items: center;
	gap: 0.65rem;
`;

const PhotoPreview = styled(MuiAvatar)`
	&& {
		width: 7.25rem;
		height: 7.25rem;
		border: 0.2rem solid rgb(218 142 91 / 0.28);
		background: rgb(255 255 255 / 0.75);
		color: ${theme.colors.softForeground};
		font-size: 0.88rem;
		font-weight: 700;
	}
`;

const AvatarSecondaryActions = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
`;

const UploadButton = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	border: 0.0625rem solid rgb(212 100 28 / 0.24);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.44);
	padding: 0.45rem 0.85rem;
	color: ${theme.colors.orangeDark};
	cursor: pointer;
	font: inherit;
	font-size: 0.88rem;
	font-weight: 700;
	transition:
		background 160ms ease,
		border-color 160ms ease,
		color 160ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
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

const Field = styled.label`
	display: grid;
	gap: 0.35rem;
	color: ${theme.colors.foreground};
	font-size: 0.88rem;
	font-weight: 700;

	input,
	textarea {
		width: 100%;
		border: 0.0625rem solid rgb(211 202 196 / 0.82);
		border-radius: 0.7rem;
		background: rgb(255 255 255 / 0.56);
		padding: 0.65rem 0.75rem;
		color: ${theme.colors.foreground};
		font: inherit;
		font-weight: 400;
	}

	textarea {
		min-height: 8.5rem;
		resize: vertical;
	}
`;

const CropModalOverlay = styled.div`
	position: fixed;
	z-index: 1600;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgb(4 18 26 / 0.52);
	padding: 1rem;
`;

const CropModal = styled.section`
	width: min(100%, 29rem);
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

const CropperShell = styled.div`
	width: min(100%, 25rem);
	height: 20rem;
	overflow: hidden;
	border: 0.0625rem solid rgb(212 100 28 / 0.18);
	border-radius: 1rem;
	background: rgb(242 239 237 / 0.7);
`;

const StyledCropper = styled(Cropper)`
	width: 100%;
	height: 100%;
`;

const CropModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	margin-top: 1rem;
`;

const ErrorText = styled.p`
	margin: 0;
	color: ${theme.colors.error};
	font-size: 0.86rem;
	line-height: 1.3;
`;

const Actions = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 0.65rem;
`;

const SecondaryButton = styled.button`
	border: 0.0625rem solid rgb(211 202 196 / 0.82);
	border-radius: 999px;
	background: rgb(255 255 255 / 0.68);
	padding: 0.5rem 0.9rem;
	color: ${theme.colors.foreground};
	cursor: pointer;
	font: inherit;
	font-weight: 700;
	transition:
		background 160ms ease,
		border-color 160ms ease,
		color 160ms ease;

	&:hover,
	&:focus-visible {
		border-color: ${theme.colors.orangeLight};
		color: ${theme.colors.orangeDark};
		outline: none;
	}
`;

const PrimaryButton = styled(SecondaryButton)`
	border-color: ${theme.colors.orangeLight};
	background: ${theme.colors.orangeLight};
	color: ${theme.colors.invertedText};
`;
