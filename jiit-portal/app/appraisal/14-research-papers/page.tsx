"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ResearchPaperEntry,
	ResearchPapersSection,
	OtherAuthor,
	PublicationType,
} from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { APPRAISAL_SECTIONS, PUBLICATION_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import AppraisalLayout from "@/components/AppraisalLayout";

export default function ResearchPapers() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<ResearchPaperEntry[]>([
		{
			id: crypto.randomUUID(),
			titleAndCompleteReference: "",
			pubType: PublicationType.IJ,
			isbnIssn: "",
			indexed: false,
			impactFactor: 0,
			userAuthorType: "",
			otherAuthors: [],
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "14-research-papers"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existingData = getSectionData("researchPapers");
		if (existingData && existingData.entries?.length > 0) {
			setEntries(
				existingData.entries.map((e) => ({
					id: e.id || crypto.randomUUID(),
					titleAndCompleteReference: e.titleAndCompleteReference || "",
					pubType: e.pubType || PublicationType.IJ,
					isbnIssn: e.isbnIssn || "",
					indexed: e.indexed || false,
					impactFactor: e.impactFactor || 0,
					userAuthorType: e.userAuthorType || "",
					otherAuthors: (e.otherAuthors || []).map((author) => ({
						id: author.id || crypto.randomUUID(),
						name: author.name || "",
						authorType: author.authorType || "",
					})),
				}))
			);
			setApiScore(existingData.apiScore ?? null);
		}
	}, []);

	const addEntry = () => {
		setEntries([
			...entries,
			{
				id: crypto.randomUUID(),
				titleAndCompleteReference: "",
				pubType: PublicationType.IJ,
				isbnIssn: "",
				indexed: false,
				impactFactor: 0,
				userAuthorType: "",
				otherAuthors: [],
			},
		]);
	};

	const removeEntry = (id: string) => {
		if (entries.length > 1) {
			setEntries(entries.filter((e) => e.id !== id));
		}
	};

	const updateEntry = (
		id: string,
		field: keyof ResearchPaperEntry,
		value: string | boolean | number | OtherAuthor[] | PublicationType
	) => {
		setEntries(
			entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
		);
	};

	const addOtherAuthor = (entryId: string) => {
		setEntries(
			entries.map((e) =>
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
		setEntries(
			entries.map((e) =>
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
		field: keyof OtherAuthor,
		value: string
	) => {
		setEntries(
			entries.map((e) =>
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

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const data: ResearchPapersSection = { entries, apiScore: null };
			const result = await simulateApiCall("research-papers", data);
			updateSectionData("researchPapers", data, result.score);
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
						8. Research Papers Published/Presented
					</CardTitle>
					<CardDescription>
						List your research publications with complete IEEE-style references
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

					<div className="mb-6 p-4 rounded-lg bg-accent/50 border border-accent">
						<h4 className="font-semibold text-sm mb-2">
							Publication Type Scores:
						</h4>
						<ul className="text-sm space-y-1 text-muted-foreground">
							{PUBLICATION_TYPES.map((type) => (
								<li key={type.value}>
									<span className="font-medium">{type.value}</span>:{" "}
									{type.label}
								</li>
							))}
						</ul>
					</div>

					<form onSubmit={onSubmit} className="space-y-6">
						{entries.map((entry, index) => (
							<Card key={entry.id} className="border-2">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">
											Publication {index + 1}
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
											placeholder='e.g., "Machine Learning in Healthcare," IEEE Trans. on Medical Imaging, vol. 42, no. 5, pp. 1234-1245, May 2024.'
											rows={4}
											required
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label>Publication Type</Label>
											<Select
												value={entry.pubType}
												onValueChange={(value: PublicationType) =>
													updateEntry(entry.id, "pubType", value)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{PUBLICATION_TYPES.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.value} - {type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>ISBN/ISSN</Label>
											<Input
												value={entry.isbnIssn}
												onChange={(e) =>
													updateEntry(entry.id, "isbnIssn", e.target.value)
												}
												placeholder="e.g., 978-3-16-148410-0"
											/>
										</div>

										<div className="space-y-2">
											<Label>Impact Factor</Label>
											<Input
												type="number"
												value={entry.impactFactor}
												onChange={(e) =>
													updateEntry(
														entry.id,
														"impactFactor",
														Number(e.target.value) || 0
													)
												}
												placeholder="e.g., 5"
												min="0"
											/>
										</div>

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
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<input
												type="checkbox"
												id={`indexed-${entry.id}`}
												checked={entry.indexed}
												onChange={(e) =>
													updateEntry(entry.id, "indexed", e.target.checked)
												}
												className="h-4 w-4 rounded border-gray-300"
											/>
											<Label htmlFor={`indexed-${entry.id}`}>
												Indexed (Scopus/Web of Science)
											</Label>
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

										{entry.otherAuthors.map((author, authorIndex) => (
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
							<Plus className="h-4 w-4 mr-2" />
							Add Another Publication
						</Button>

						<div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
							{prevSection && (
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push(prevSection.route)}
								>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Previous
								</Button>
							)}

							<Button
								type="submit"
								disabled={isSubmitting}
								className="sm:order-2"
							>
								<Save className="h-4 w-4 mr-2" />
								{isSubmitting ? "Submitting..." : "Submit Section"}
							</Button>

							{nextSection && (
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push(nextSection.route)}
									className="sm:order-3"
								>
									Next
									<ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</AppraisalLayout>
	);
}
