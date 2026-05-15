"use client";

import { useEffect } from "react";
import styled from "styled-components";

import {
	getAvatarAssetUrl,
	useAvatarsQuery,
} from "@/shared/api/avatarsRepository";
import { theme } from "@/shared/theme";

import { StepBody, StepDescription, StepTitle } from "./stepStyles";

interface AvatarStepProps {
	avatarUrl: string;
	onAvatarChange: (url: string) => void;
}

export const AvatarStep = ({ avatarUrl, onAvatarChange }: AvatarStepProps) => {
	const { data } = useAvatarsQuery();
	const avatars = data ?? [];
	const selectedAvatar = avatars.find((a) => a.url === avatarUrl) ?? avatars[0];

	// Set default avatar as soon as the list loads
	useEffect(() => {
		if (!avatarUrl && avatars.length > 0) {
			onAvatarChange(avatars[0].url);
		}
	}, [avatarUrl, avatars, onAvatarChange]);

	return (
		<StepBody>
			<StepTitle>Выбери аватар</StepTitle>
			<StepDescription>
				Выбери дракончика, который будет представлять тебя. Не волнуйся, ты
				всегда сможешь сменить его позже!
			</StepDescription>
			<AvatarLayout>
				<AvatarPreviewLarge>
					{selectedAvatar ? (
						<AvatarPreviewImage
							alt=""
							src={getAvatarAssetUrl(selectedAvatar.url)}
						/>
					) : (
						<AvatarPreviewFallback>L</AvatarPreviewFallback>
					)}
				</AvatarPreviewLarge>
				<AvatarScrollStrip>
					{avatars.map((avatar) => {
						const isSelected = avatar.url === selectedAvatar?.url;
						return (
							<AvatarOption
								key={avatar.id}
								aria-label={`Выбрать аватар ${avatar.id}`}
								aria-pressed={isSelected}
								type="button"
								$isSelected={isSelected}
								onClick={() => onAvatarChange(avatar.url)}
							>
								<AvatarOptionImage alt="" src={getAvatarAssetUrl(avatar.url)} />
							</AvatarOption>
						);
					})}
				</AvatarScrollStrip>
			</AvatarLayout>
		</StepBody>
	);
};

const AvatarLayout = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
	margin-top: 1.5rem;
`;

const AvatarPreviewLarge = styled.div`
	display: grid;
	width: 8.5rem;
	height: 8.5rem;
	place-items: center;
	overflow: hidden;
	border-radius: 50%;
	background: ${theme.alpha.blueWash};
	box-shadow: 0 0 0 0.3rem rgb(218 142 91 / 0.15);
`;

const AvatarPreviewImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const AvatarPreviewFallback = styled.span`
	color: ${theme.colors.bluePrimary};
	font-size: 3rem;
	font-weight: 700;
	line-height: 1;
`;

const AvatarScrollStrip = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.75rem;
	width: 100%;
	max-height: 17rem;
	overflow-y: auto;
	padding: 0.25rem;

	&::-webkit-scrollbar {
		width: 0.25rem;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgb(186 183 180 / 0.5);
		border-radius: 999px;
	}
`;

const AvatarOption = styled.button<{ $isSelected: boolean }>`
	position: relative;
	display: grid;
	width: 5rem;
	height: 5rem;
	flex-shrink: 0;
	place-items: center;
	overflow: hidden;
	border: 0.1875rem solid
		${({ $isSelected }) => ($isSelected ? "#da8e5b" : "transparent")};
	border-radius: 50%;
	background: ${theme.colors.background};
	padding: 0;
	cursor: pointer;
	transform: ${({ $isSelected }) => ($isSelected ? "scale(1.1)" : "scale(1)")};
	transition:
		border-color 150ms,
		transform 150ms;

	&:hover {
		border-color: ${({ $isSelected }) =>
			$isSelected ? "#da8e5b" : "rgb(218 142 91 / 0.5)"};
		transform: scale(${({ $isSelected }) => ($isSelected ? "1.1" : "1.05")});
	}
`;

const AvatarOptionImage = styled.img`
	width: 100%;
	height: 100%;
	border-radius: 50%;
	object-fit: cover;
`;
