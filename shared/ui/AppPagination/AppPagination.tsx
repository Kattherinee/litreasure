"use client";

import MuiPagination from "@mui/material/Pagination";
import styled from "styled-components";

import { theme } from "@/shared/theme";

interface IAppPaginationProps {
	count: number;
	page: number;
	onChange: (page: number) => void;
}

export const AppPagination = ({
	count,
	page,
	onChange,
}: IAppPaginationProps) => {
	if (count <= 1) return null;

	return (
		<PaginationWrap>
			<MuiPagination
				boundaryCount={1}
				count={count}
				page={page}
				siblingCount={2}
				onChange={(_, value) => onChange(value)}
			/>
		</PaginationWrap>
	);
};

const PaginationWrap = styled.div`
	display: flex;
	justify-content: center;
	padding: 1rem 0 1.5rem;

	.MuiPagination-ul {
		gap: 0.2rem;
	}

	.MuiPaginationItem-root {
		font-family: ${theme.fonts.sans};
		font-size: 0.875rem;
		color: ${theme.colors.foreground};
		border-radius: 50%;
		min-width: 2.1rem;
		height: 2.1rem;
		border: 0.0625rem solid transparent;
		transition:
			background 160ms ease,
			color 160ms ease,
			border-color 160ms ease;

		&:hover {
			background: ${theme.colors.surface};
			border-color: ${theme.colors.orangeLight};
			color: ${theme.colors.orangeLight};
		}

		&.Mui-selected {
			background: ${theme.colors.orangeLight};
			border-color: ${theme.colors.orangeLight};
			color: #fff;
			font-weight: 700;

			&:hover {
				background: ${theme.colors.darkerOrangeLight};
				border-color: ${theme.colors.darkerOrangeLight};
			}
		}

		&.Mui-disabled {
			opacity: 0.3;
		}
	}

	.MuiPaginationItem-ellipsis {
		border: none;
		border-radius: 0;
		color: ${theme.colors.softForeground};
	}

	.MuiSvgIcon-root {
		color: ${theme.colors.softForeground};
		font-size: 1.1rem;
	}

	.MuiPaginationItem-previousNext:not(.Mui-disabled) .MuiSvgIcon-root {
		color: ${theme.colors.foreground};
	}
`;
