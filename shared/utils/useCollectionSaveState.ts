import { useCallback, useState } from "react";
import type { ICollectionPreview } from "@/shared/api/collections";
import {
	useSaveCollectionMutation,
	useUnsaveCollectionMutation,
} from "@/shared/api/collections";

export function useCollectionSaveState(initialSaved?: boolean) {
	const saveCollectionMutation = useSaveCollectionMutation();
	const unsaveCollectionMutation = useUnsaveCollectionMutation();
	const [savedCollectionOverrides, setSavedCollectionOverrides] = useState<
		Record<string, boolean>
	>({});
	const [savingCollectionId, setSavingCollectionId] = useState("");
	const [collectionStatus, setCollectionStatus] = useState("");

	const isCollectionMutationPending =
		saveCollectionMutation.isPending || unsaveCollectionMutation.isPending;

	const getIsCollectionSaved = useCallback(
		(collection: ICollectionPreview) =>
			savedCollectionOverrides[collection.id] ??
			collection.isSaved ??
			initialSaved ??
			false,
		[savedCollectionOverrides, initialSaved],
	);

	const handleToggleCollectionSave = async (
		collection: ICollectionPreview,
		isAuthenticated: boolean,
		requestAuth: () => void,
	) => {
		setCollectionStatus("");
		if (!isAuthenticated) {
			requestAuth();
			return;
		}
		const wasSaved = getIsCollectionSaved(collection);
		try {
			setSavingCollectionId(collection.id);
			setSavedCollectionOverrides((currentState) => ({
				...currentState,
				[collection.id]: !wasSaved,
			}));
			if (wasSaved) {
				await unsaveCollectionMutation.mutateAsync(collection.id);
				setCollectionStatus("Подборка убрана из сохраненных");
			} else {
				await saveCollectionMutation.mutateAsync(collection.id);
				setCollectionStatus("Подборка сохранена");
			}
		} catch (error) {
			setSavedCollectionOverrides((currentState) => ({
				...currentState,
				[collection.id]: wasSaved,
			}));
			setCollectionStatus(
				error instanceof Error
					? error.message
					: "Не удалось изменить сохранение подборки",
			);
		} finally {
			setSavingCollectionId("");
		}
	};

	return {
		isCollectionMutationPending,
		getIsCollectionSaved,
		handleToggleCollectionSave,
		savingCollectionId,
		collectionStatus,
		setCollectionStatus,
	};
}
