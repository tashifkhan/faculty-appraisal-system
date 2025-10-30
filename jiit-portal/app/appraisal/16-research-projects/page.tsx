"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import {
	ResearchProjectEntry,
	ResearchProjectsSection,
	ResearchProjectAuthor,
} from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ResearchProjectsPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<ResearchProjectEntry[]>([
		{
			id: crypto.randomUUID(),
			title: "",
			sponsoringAgency: "",
			duration: "",
			sanctionDate: "",
			status: "Completed",
			isHss: false,
			amountSanctioned: 0,
			isConsultancy: false,
			userAuthorType: "",
			otherAuthors: [],
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "16-research-projects"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("researchProjects") as
			| ResearchProjectsSection
			| undefined;
		if (existing?.entries?.length) {
			setEntries(
				existing.entries.map((e) => ({
					id: e.id || crypto.randomUUID(),
					title: e.title || "",
					sponsoringAgency: e.sponsoringAgency || "",
					duration: e.duration || "",
					sanctionDate: e.sanctionDate || "",
					status: e.status || "Completed",
					isHss: e.isHss || false,
					amountSanctioned: Number(e.amountSanctioned) || 0,
					isConsultancy: e.isConsultancy || false,
					userAuthorType: e.userAuthorType || "",
					otherAuthors: (e.otherAuthors || []).map((author) => ({
						id: author.id || crypto.randomUUID(),
						name: author.name || "",
						authorType: author.authorType || "",
					})),
				}))
			);
			setApiScore(existing.apiScore ?? null);
		}
	}, []);

	const addEntry = () => {
		setEntries((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				title: "",
				sponsoringAgency: "",
				duration: "",
				sanctionDate: "",
				status: "Ongoing",
				isHss: false,
				amountSanctioned: 0,
				isConsultancy: false,
				userAuthorType: "",
				otherAuthors: [],
			},
		]);
	};

	const removeEntry = (id: string) => {
		if (entries.length > 1) setEntries(entries.filter((e) => e.id !== id));
	};

	const updateEntry = <K extends keyof ResearchProjectEntry>(
		id: string,
		key: K,
		value: ResearchProjectEntry[K]
	) => {
		setEntries((prev) =>
			prev.map((e) => (e.id === id ? { ...e, [key]: value } : e))
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
		field: keyof ResearchProjectAuthor,
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

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const payload: ResearchProjectsSection = { entries, apiScore: null };
			const result = await simulateApiCall("research-projects", payload);
			updateSectionData("researchProjects", payload, result.score);
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
						10. Research Projects and Consultancy Works
					</CardTitle>
					<CardDescription>
						Manage your research projects and consultancy entries.
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
						{entries.map((entry, idx) => (
							<Card key={entry.id} className="border-2">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">Entry {idx + 1}</CardTitle>
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
										<Label>Title of Project / Consultancy</Label>
										<Input
											value={entry.title}
											onChange={(e) =>
												updateEntry(entry.id, "title", e.target.value)
											}
											required
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label>Sponsoring Agency</Label>
											<Input
												value={entry.sponsoringAgency}
												onChange={(e) =>
													updateEntry(
														entry.id,
														"sponsoringAgency",
														e.target.value
													)
												}
											/>
										</div>

										<div className="space-y-2">
											<Label>Duration</Label>
											<Input
												value={entry.duration}
												onChange={(e) =>
													updateEntry(entry.id, "duration", e.target.value)
												}
												placeholder="e.g., 2 years"
											/>
										</div>

										<div className="space-y-2">
											<Label>Sanction Date</Label>
											<Input
												type="date"
												value={entry.sanctionDate}
												onChange={(e) =>
													updateEntry(entry.id, "sanctionDate", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2">
											<Label>Status</Label>
											<Select
												value={entry.status}
												onValueChange={(value) =>
													updateEntry(entry.id, "status", value)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Completed">Completed</SelectItem>
													<SelectItem value="Ongoing">Ongoing</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>Amount Sanctioned</Label>
											<Input
												type="number"
												value={Number(entry.amountSanctioned)}
												onChange={(e) =>
													updateEntry(
														entry.id,
														"amountSanctioned",
														Number(e.target.value) || 0
													)
												}
												placeholder="e.g., 50000"
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
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Chief Investigator">
														Chief Investigator
													</SelectItem>
													<SelectItem value="Co-Investigator">
														Co-Investigator
													</SelectItem>
													<SelectItem value="Principal Investigator">
														Principal Investigator
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<input
													type="checkbox"
													id={`isHss-${entry.id}`}
													checked={entry.isHss}
													onChange={(e) =>
														updateEntry(entry.id, "isHss", e.target.checked)
													}
													className="h-4 w-4 rounded border-gray-300"
												/>
												<Label htmlFor={`isHss-${entry.id}`}>
													HSS (Humanities & Social Sciences)
												</Label>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<input
													type="checkbox"
													id={`isConsultancy-${entry.id}`}
													checked={entry.isConsultancy}
													onChange={(e) =>
														updateEntry(
															entry.id,
															"isConsultancy",
															e.target.checked
														)
													}
													className="h-4 w-4 rounded border-gray-300"
												/>
												<Label htmlFor={`isConsultancy-${entry.id}`}>
													This is a consultancy project
												</Label>
											</div>
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
															<SelectItem value="Chief Investigator">
																Chief Investigator
															</SelectItem>
															<SelectItem value="Co-Investigator">
																Co-Investigator
															</SelectItem>
															<SelectItem value="Principal Investigator">
																Principal Investigator
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
							className="w-full"
							onClick={addEntry}
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
