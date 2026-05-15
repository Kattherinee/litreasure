"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthModal, { type AuthModalMode } from "@/components/pages/AuthModal";
import HomePage from "@/components/pages/HomePage";

type AuthPageProps = {
	mode: AuthModalMode;
};

const AuthPage = ({ mode }: AuthPageProps) => {
	const router = useRouter();
	const [modalMode, setModalMode] = useState<AuthModalMode>(mode);

	return (
		<>
			<HomePage />
			<AuthModal
				mode={modalMode}
				onClose={() => router.push("/")}
				onModeChange={setModalMode}
			/>
		</>
	);
};

export default AuthPage;
