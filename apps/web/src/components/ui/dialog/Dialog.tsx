import clsx from "clsx";
import {
	type FC,
	type ReactEventHandler,
	type ReactNode,
	useEffect,
	useRef,
} from "react";

// import "./dialog.css";

interface DialogProps {
	open: boolean;
	onClose?: () => void;
	children: ReactNode;
	manual?: boolean;
	className?: string;
	closedBy?: "closerequest" | "any" | "none";
	resetOnClose?: boolean;
}

export const Dialog: FC<DialogProps> = ({
	open,
	onClose,
	children,
	closedBy = "closerequest",
	className = "",
}) => {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;

		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	// const handleClose: ReactEventHandler<HTMLDialogElement> = (e) => {
	// 	e.preventDefault();
	// 	e.stopPropagation();
	// 	onClose?.()
	// }

	return (
		<dialog
			/*@ts-expect-error unknown attribute*/
			closedby={closedBy}
			onClose={() => onClose?.()}
			// onClose={handleClose}
			ref={ref}
			className={clsx(
				"backdrop:bg-black/80 backdrop:backdrop-blur-sm m-auto transition-discrete rs-dialog",
				className,
			)}
		>
			{children}
		</dialog>
	);
};

export default Dialog;
