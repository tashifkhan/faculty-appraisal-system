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
	ResearchGuidanceEntry,
	ResearchGuidanceSection,
	ResearchGuidanceAuthor,
} from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ResearchGuidancePage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<ResearchGuidanceEntry[]>([
		{
			id: crypto.randomUUID(),
			title: "",
			enrollNoAndName: "",
			degree: "",
			status: "",
			monthsOngoing: 0,
			userAuthorType: "",
			otherAuthors: [],
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "17-research-guidance"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("researchGuidance") as
			| ResearchGuidanceSection
			| undefined;
		if (existing) {
			setApiScore(existing.apiScore ?? null);
			if (existing.entries?.length) {
				setEntries(
					existing.entries.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
						otherAuthors:
							e.otherAuthors?.map((a) => ({
								...a,
								id: a.id || crypto.randomUUID(),
							})) || [],
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
				title: "",
				enrollNoAndName: "",
				degree: "",
				status: "",
				monthsOngoing: 0,
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

	const updateEntry = <K extends keyof ResearchGuidanceEntry>(
		id: string,
		key: K,
		value: ResearchGuidanceEntry[K]
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
								{ id: crypto.randomUUID(), name: "", authorType: "" },
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
		field: keyof ResearchGuidanceAuthor,
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

	const payload: ResearchGuidanceSection = useMemo(
		() => ({ entries, apiScore: null }),
		[entries]
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall("research-guidance", payload);
			updateSectionData("researchGuidance", payload, result.score);
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
					<CardTitle className="text-2xl">11. Research Guidance</CardTitle>
					<CardDescription>
						Enter thesis/dissertation guidance details for your supervisees.
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
						{entries.map((entry, index) => (
							<Card key={entry.id}>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">
											Research Guidance Entry {index + 1}
										</CardTitle>
										{entries.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeEntry(entry.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label>Title of Thesis/Dissertation/Project</Label>
										<Input
											value={entry.title}
											onChange={(e) =>
												updateEntry(entry.id, "title", e.target.value)
											}
											placeholder="e.g., Exploring the Impact of AI on Education"
											required
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label>Enrol. No. & Name</Label>
											<Input
												value={entry.enrollNoAndName}
												onChange={(e) =>
													updateEntry(
														entry.id,
														"enrollNoAndName",
														e.target.value
													)
												}
												placeholder="e.g., 22102141 - Arsh Gupta"
											/>
										</div>

										<div className="space-y-2">
											<Label>Degree</Label>
											<Select
												value={entry.degree}
												onValueChange={(value) =>
													updateEntry(entry.id, "degree", value)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select degree" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="M.Tech.">M.Tech.</SelectItem>
													<SelectItem value="M.Phil.">M.Phil.</SelectItem>
													<SelectItem value="D.D.">D.D.</SelectItem>
													<SelectItem value="M.S.">M.S.</SelectItem>
												</SelectContent>
											</Select>
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
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Completed">Completed</SelectItem>
													<SelectItem value="Ongoing">Ongoing</SelectItem>
													<SelectItem value="Submitted">Submitted</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>Months Ongoing</Label>
											<Input
												type="number"
												value={Number(entry.monthsOngoing)}
												onChange={(e) =>
													updateEntry(
														entry.id,
														"monthsOngoing",
														Number(e.target.value) || 0
													)
												}
												placeholder="e.g., 36"
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
													<SelectItem value="Supervisor">Supervisor</SelectItem>
													<SelectItem value="Co-Supervisor">
														Co-Supervisor
													</SelectItem>
													<SelectItem value="Joint Supervisor">
														Joint Supervisor
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Other Authors Section */}
									<div className="space-y-3 pt-4 border-t">
										<div className="flex items-center justify-between">
											<Label className="text-base">Other Supervisors</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => addOtherAuthor(entry.id)}
											>
												<Plus className="h-4 w-4 mr-1" />
												Add Supervisor
											</Button>
										</div>

										{entry.otherAuthors.map((author) => (
											<div
												key={author.id}
												className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/30"
											>
												<div className="space-y-1">
													<Label className="text-xs">Supervisor Name</Label>
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
														placeholder="Dr. John Doe"
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
															<SelectItem value="Supervisor">
																Supervisor
															</SelectItem>
															<SelectItem value="Co-Supervisor">
																Co-Supervisor
															</SelectItem>
															<SelectItem value="Joint Supervisor">
																Joint Supervisor
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
