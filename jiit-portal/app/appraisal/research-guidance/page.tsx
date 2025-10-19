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
	ResearchGuidanceLevel,
	ResearchGuidanceSection,
	ResearchGuidanceStatus,
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
			enrolmentAndName: "",
			title: "",
			jointSupervisors: "",
			level: "PhD",
			status: "Completed",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "research-guidance"
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
				enrolmentAndName: "",
				title: "",
				jointSupervisors: "",
				level: "MTech",
				status: "Ongoing",
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
		} catch (_e) {
			toast.error("Failed to submit section");
		} finally {
			setIsSubmitting(false);
		}
	};

	const levelOptions: ResearchGuidanceLevel[] = ["PhD", "MTech", "BTech"];
	const statusOptions: ResearchGuidanceStatus[] = ["Completed", "Ongoing"];

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
						<div className="rounded-lg border overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-muted/50 text-muted-foreground">
									<tr>
										<th className="px-4 py-3 text-left w-[22%]">
											Enrol. No. &amp; Name
										</th>
										<th className="px-4 py-3 text-left w-[30%]">
											Title of Thesis/Dissertation/Project
										</th>
										<th className="px-4 py-3 text-left w-[22%]">
											Joint Supervisors
										</th>
										<th className="px-4 py-3 text-left w-[10%]">Level</th>
										<th className="px-4 py-3"></th>
									</tr>
								</thead>
								<tbody>
									{entries.map((e) => {
										// Row score mirrors calculateResearchGuidanceScore level mapping
										const levelScoreMap: Record<ResearchGuidanceLevel, number> =
											{
												PhD: 10,
												MTech: 5,
												BTech: 4,
											};
										const rowScore = levelScoreMap[e.level] ?? 5;
										return (
											<tr key={e.id} className="border-t align-top">
												<td className="p-3">
													<Input
														value={e.enrolmentAndName}
														onChange={(ev) =>
															updateEntry(
																e.id,
																"enrolmentAndName",
																ev.target.value
															)
														}
														placeholder="e.g., 2019PHD001 - Alice Johnson"
													/>
												</td>
												<td className="p-3">
													<Input
														value={e.title}
														onChange={(ev) =>
															updateEntry(e.id, "title", ev.target.value)
														}
														placeholder="e.g., Exploring the Impact of AI on Education"
													/>
												</td>
												<td className="p-3">
													<Input
														value={e.jointSupervisors}
														onChange={(ev) =>
															updateEntry(
																e.id,
																"jointSupervisors",
																ev.target.value
															)
														}
														placeholder="e.g., Dr. Robert Smith"
													/>
												</td>
												<td className="p-3">
													<Select
														value={e.level}
														onValueChange={(v: ResearchGuidanceLevel) =>
															updateEntry(e.id, "level", v)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{levelOptions.map((opt) => (
																<SelectItem key={opt} value={opt}>
																	{opt}
																</SelectItem>
															))}
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
