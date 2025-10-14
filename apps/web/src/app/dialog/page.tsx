"use client";

import { useState } from "react";
import Dialog from "src/components/ui/dialog/Dialog";

function SubDialog() {
	const [open, setOpen] = useState(false);

	return (
		<div
			className={"grid size-60 place-items-center bg-black/80 backdrop-blur-sm"}
		>
			<button
				onClick={() => setOpen(true)}
				className={
					"px-4 py-2 bg-neutral-100 text-black rounded-sm cursor-pointer"
				}
				type="button"
			>
				Open Child Dialog
			</button>
			<Dialog
				className={"rounded-xl bg-red-500/60 backdrop-blur-sm"}
				open={open}
				onClose={() => setOpen(false)}
			>
				<div className="p-6 h-60 w-60">
					<form method={"dialog"}>
						<button
							type={"submit"}
							className={
								"cursor-pointer size-12 rounded-full bg-blue-400 font-black"
							}
						>
							X
						</button>
					</form>
					<h1>Hello, again.</h1>
				</div>
			</Dialog>
		</div>
	);
}

export default function DialogPage() {
	const [open, setOpen] = useState(false);
	return (
		<div
			className={
				"grid h-dvh w-screen place-items-center bg-gradient-to-br from-green-400 via-teal-500 to-blue-600"
			}
		>
			<button
				onClick={() => setOpen(true)}
				className={
					"px-4 py-2 bg-neutral-100 text-black rounded-sm cursor-pointer"
				}
				type="button"
			>
				Say Hello
			</button>
			<Dialog
				className={"rounded-xl"}
				open={open}
				onClose={() => setOpen(false)}
			>
				<div className="p-6 h-120 w-120">
					<form method={"dialog"}>
						<button
							type={"submit"}
							className={
								"cursor-pointer size-12 rounded-full bg-blue-400 font-black"
							}
						>
							X
						</button>
					</form>

					<h1>Hello There</h1>
				</div>
			</Dialog>
		</div>
	);
}
