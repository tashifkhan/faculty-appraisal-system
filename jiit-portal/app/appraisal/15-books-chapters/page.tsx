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
import {
	BookChapterEntry,
	BooksChaptersSection,
	BookChapterAuthor,
} from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function BooksChaptersPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<BookChapterEntry[]>([
		{
			id: crypto.randomUUID(),
			titleAndCompleteReference: "",
			publisherType: "",
			isChapter: false,
			numberOfChapters: 0,
			userAuthorType: "",
			otherAuthors: [],
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "15-books-chapters"
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
						id: e.id || crypto.randomUUID(),
						titleAndCompleteReference: e.titleAndCompleteReference || "",
						publisherType: e.publisherType || "",
						isChapter: e.isChapter || false,
						numberOfChapters: e.numberOfChapters || 0,
						userAuthorType: e.userAuthorType || "",
						otherAuthors: (e.otherAuthors || []).map((author) => ({
							id: author.id || crypto.randomUUID(),
							name: author.name || "",
							authorType: author.authorType || "",
						})),
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
				titleAndCompleteReference: "",
				publisherType: "",
				isChapter: false,
				numberOfChapters: 0,
				userAuthorType: "",
				otherAuthors: [],
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

	const addOtherAuthor = (entryId: string) => {
		setEntries((list) =>
			list.map((e) =>
				e.id === entryId
					? {
							...e,
							otherAuthors: [
								...e.otherAuthors,
								{
									id: crypto.randomUUID(),
									name: "",
									authorType: "",
								},
							],
					  }
					: e
			)
		);
	};

	const removeOtherAuthor = (entryId: string, authorId: string) => {
		setEntries((list) =>
			list.map((e) =>
				e.id === entryId
					? {
							...e,
							otherAuthors: e.otherAuthors.filter((a) => a.id !== authorId),
					  }
					: e
			)
		);
	};

	const updateOtherAuthor = (
		entryId: string,
		authorId: string,
		field: keyof BookChapterAuthor,
		value: string
	) => {
		setEntries((list) =>
			list.map((e) =>
				e.id === entryId
					? {
							...e,
							otherAuthors: e.otherAuthors.map((a) =>
								a.id === authorId ? { ...a, [field]: value } : a
							),
					  }
					: e
			)
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
		} catch {
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

					<form onSubmit={onSubmit} className="space-y-6">
						{entries.map((entry, index) => (
							<Card key={entry.id} className="border-2">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">
											Book/Chapter {index + 1}
										</CardTitle>
										{entries.length > 1 && (
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => removeEntry(entry.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label>Title and Complete Reference (IEEE Style)</Label>
										<Textarea
											value={entry.titleAndCompleteReference}
											onChange={(e) =>
												updateEntry(
													entry.id,
													"titleAndCompleteReference",
													e.target.value
												)
											}
											placeholder='e.g., "The Future of AI," IEEE Press, 2024.'
											rows={4}
											required
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label>Publication Type</Label>
											<Select
												value={entry.isChapter ? "chapter" : "book"}
												onValueChange={(value) =>
													updateEntry(
														entry.id,
														"isChapter",
														value === "chapter"
													)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="book">Book</SelectItem>
													<SelectItem value="chapter">Chapter</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>Publisher Type</Label>
											<Input
												value={entry.publisherType}
												onChange={(e) =>
													updateEntry(entry.id, "publisherType", e.target.value)
												}
												placeholder="e.g., IEEE Press, Springer"
											/>
										</div>

										{entry.isChapter && (
											<div className="space-y-2">
												<Label>Number of Chapters</Label>
												<Input
													type="number"
													value={entry.numberOfChapters}
													onChange={(e) =>
														updateEntry(
															entry.id,
															"numberOfChapters",
															Number(e.target.value) || 0
														)
													}
													placeholder="e.g., 12"
													min="0"
												/>
											</div>
										)}

										<div className="space-y-2">
											<Label>User Author Type</Label>
											<Select
												value={entry.userAuthorType}
												onValueChange={(value) =>
													updateEntry(entry.id, "userAuthorType", value)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select author type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="first author">
														First Author
													</SelectItem>
													<SelectItem value="corresponding author">
														Corresponding Author
													</SelectItem>
													<SelectItem value="co-author">Co-author</SelectItem>
													<SelectItem value="editor">Editor</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Other Authors Section */}
									<div className="space-y-3 pt-4 border-t">
										<div className="flex items-center justify-between">
											<Label className="text-base">Other Authors</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => addOtherAuthor(entry.id)}
											>
												<Plus className="h-4 w-4 mr-1" />
												Add Author
											</Button>
										</div>

										{entry.otherAuthors.map((author) => (
											<div
												key={author.id}
												className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/30"
											>
												<div className="space-y-1">
													<Label className="text-xs">Author Name</Label>
													<Input
														value={author.name}
														onChange={(e) =>
															updateOtherAuthor(
																entry.id,
																author.id,
																"name",
																e.target.value
															)
														}
														placeholder="John Doe"
													/>
												</div>
												<div className="space-y-1">
													<Label className="text-xs">Author Type</Label>
													<Select
														value={author.authorType}
														onValueChange={(value) =>
															updateOtherAuthor(
																entry.id,
																author.id,
																"authorType",
																value
															)
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select type" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="first author">
																First Author
															</SelectItem>
															<SelectItem value="corresponding author">
																Corresponding Author
															</SelectItem>
															<SelectItem value="co-author">
																Co-author
															</SelectItem>
															<SelectItem value="editor">Editor</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="flex items-end">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() =>
															removeOtherAuthor(entry.id, author.id)
														}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						))}

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
