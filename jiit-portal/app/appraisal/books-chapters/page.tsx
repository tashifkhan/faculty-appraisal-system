"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { BookChapterEntry, BooksChaptersSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BooksChaptersPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<BookChapterEntry[]>([
		{
			id: crypto.randomUUID(),
			authors: "",
			titleAndReference: "",
			publicationType: "B",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "books-chapters"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("booksChapters") as
			| BooksChaptersSection
			| undefined;
		if (existing) {
			setApiScore(existing.apiScore ?? null);
			if (existing.entries?.length) {
				setEntries(
					existing.entries.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
		}
	}, []);

	const addEntry = () => {
		setEntries((list) => [
			...list,
			{
				id: crypto.randomUUID(),
				authors: "",
				titleAndReference: "",
				publicationType: "B",
			},
		]);
	};

	const removeEntry = (id: string) => {
		setEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	};

	const updateEntry = <K extends keyof BookChapterEntry>(
		id: string,
		key: K,
		value: BookChapterEntry[K]
	) => {
		setEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);
	};

	const payload: BooksChaptersSection = useMemo(
		() => ({ entries, apiScore: null }),
		[entries]
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall("books-chapters", payload);
			updateSectionData("booksChapters", payload, result.score);
			setApiScore(result.score);
			toast.success(result.message);
		} catch (_e) {
			toast.error("Failed to submit section");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AppraisalLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						9. Books, Chapters in Books Written
					</CardTitle>
					<CardDescription>
						Add or edit your publications. Ensure all details are accurate as
						per IEEE style.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{apiScore !== null && (
						<div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4">
							<p className="text-sm font-medium text-success">
								✓ Section Completed - API Score: {apiScore}
							</p>
						</div>
					)}

					<form onSubmit={onSubmit} className="space-y-4">
						<div className="rounded-lg border overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-muted/50 text-muted-foreground">
									<tr>
										<th className="px-4 py-3 text-left w-1/4">
											Names of All Authors in Order
										</th>
										<th className="px-4 py-3 text-left w-2/5">
											Title and Complete Reference in IEEE Style
										</th>
										<th className="px-4 py-3 text-left w-1/6">
											Type of Publication
										</th>
										<th className="px-4 py-3"></th>
									</tr>
								</thead>
								<tbody>
									{entries.map((e) => {
										const rowScore = e.publicationType === "B" ? 20 : 10; // matches mock scoring
										return (
											<tr key={e.id} className="border-t align-top">
												<td className="p-3">
													<Input
														value={e.authors}
														onChange={(ev) =>
															updateEntry(e.id, "authors", ev.target.value)
														}
														placeholder="e.g., Dr. Jane Doe, Dr. John Smith"
													/>
												</td>
												<td className="p-3">
													<Textarea
														rows={3}
														value={e.titleAndReference}
														onChange={(ev) =>
															updateEntry(
																e.id,
																"titleAndReference",
																ev.target.value
															)
														}
														placeholder="e.g., The Future of AI, IEEE Press, 2024."
													/>
												</td>
												<td className="p-3">
													<Select
														value={e.publicationType}
														onValueChange={(v: "B" | "C") =>
															updateEntry(e.id, "publicationType", v)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="B">B-Book</SelectItem>
															<SelectItem value="C">C-Chapter</SelectItem>
														</SelectContent>
													</Select>
												</td>
												<td className="p-3 text-right">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => removeEntry(e.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						<Button
							type="button"
							variant="outline"
							onClick={addEntry}
							className="w-full"
						>
							<Plus className="h-4 w-4 mr-2" /> Add New Entry
						</Button>

						<div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
							{prevSection && (
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push(prevSection.route)}
								>
									<ArrowLeft className="h-4 w-4 mr-2" /> Previous
								</Button>
							)}

							<Button
								type="submit"
								disabled={isSubmitting}
								className="sm:order-2"
							>
								<Save className="h-4 w-4 mr-2" />{" "}
								{isSubmitting ? "Submitting..." : "Submit Section"}
							</Button>

							{nextSection && (
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push(nextSection.route)}
									className="sm:order-3"
								>
									Next <ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</AppraisalLayout>
	);
}
