"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import {
	ProjectGuidanceSection,
	ExamDutiesSection,
	ExamDutyEntry,
} from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const ACTIVITY_OPTIONS: { value: ExamDutyEntry["activity"]; label: string }[] =
	[
		{ value: "qp_set", label: "No. of Q. Papers Set" },
		{ value: "ab_evaluated", label: "No. of A/B Evaluated" },
		{ value: "practical_conducted", label: "No. of Practical Exams Conducted" },
		{
			value: "invigilation_duties",
			label: "No. of Examination Invigilation Duties",
		},
	];

export default function ProjectGuidanceAndExamDutiesPage() {
	const router = useRouter();
	const isMobile = useIsMobile();

	// Combined submission state
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Project Guidance state
	const [apiScorePG, setApiScorePG] = useState<number | null>(null);
	const [projectsGuided, setProjectsGuided] = useState<number>(0);
	const [studentsGuided, setStudentsGuided] = useState<number>(0);

	// Exam Duties state
	const [apiScoreED, setApiScoreED] = useState<number | null>(null);
	const [entries, setEntries] = useState<ExamDutyEntry[]>([
		{
			id: crypto.randomUUID(),
			activity: "qp_set",
			classLevel: "UG",
			t1: 0,
			t2: 0,
			t3: 0,
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "12-3-4-project-guidance-and-exam-duties"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		// Load Project Guidance data
		const existingPG = getSectionData("projectGuidance") as
			| ProjectGuidanceSection
			| undefined;
		if (existingPG) {
			setProjectsGuided(Number(existingPG.projectsGuided) || 0);
			setStudentsGuided(Number(existingPG.studentsGuided) || 0);
			setApiScorePG(existingPG.apiScore ?? null);
		}

		// Load Exam Duties data
		const existingED = getSectionData("examDuties") as
			| ExamDutiesSection
			| undefined;
		if (existingED) {
			setApiScoreED(existingED.apiScore ?? null);
			if (existingED.entries?.length) {
				setEntries(
					existingED.entries.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
		}
	}, []);

	const onSubmitBothSections = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			// Submit Project Guidance
			const payloadPG: ProjectGuidanceSection = {
				projectsGuided: Number.isFinite(projectsGuided) ? projectsGuided : 0,
				studentsGuided: Number.isFinite(studentsGuided) ? studentsGuided : 0,
				apiScore: null,
			};
			const resultPG = await simulateApiCall("project-guidance", payloadPG);
			updateSectionData("projectGuidance", payloadPG, resultPG.score);
			setApiScorePG(resultPG.score);

			// Submit Exam Duties
			const payloadED: ExamDutiesSection = { entries, apiScore: null };
			const resultED = await simulateApiCall("exam-duties", payloadED);
			updateSectionData("examDuties", payloadED, resultED.score);
			setApiScoreED(resultED.score);

			toast.success("Both sections submitted successfully!");
		} catch {
			toast.error("Failed to submit sections");
		} finally {
			setIsSubmitting(false);
		}
	};

	const addEntry = () => {
		setEntries((list) => [
			...list,
			{
				id: crypto.randomUUID(),
				activity: "qp_set",
				classLevel: "UG",
				t1: 0,
				t2: 0,
				t3: 0,
			},
		]);
	};

	const removeEntry = (id: string) => {
		setEntries((list) => {
			if (list.length <= 1) return list;

			const entryToRemove = list.find((e) => e.id === id);

			// If removing an invigilation_duties entry, find and remove its pair too
			if (entryToRemove?.activity === "invigilation_duties") {
				const pairType =
					entryToRemove.invigilationType === "allotted"
						? "performed"
						: "allotted";

				return list.filter(
					(e) =>
						e.id !== id &&
						!(
							e.activity === "invigilation_duties" &&
							e.invigilationType === pairType &&
							// Only remove the pair if it has the same T1, T2, T3 values (indicating it's the auto-created pair)
							e.t1 === entryToRemove.t1 &&
							e.t2 === entryToRemove.t2 &&
							e.t3 === entryToRemove.t3
						)
				);
			}

			return list.filter((e) => e.id !== id);
		});
	};

	const updateEntry = <K extends keyof ExamDutyEntry>(
		id: string,
		key: K,
		value: ExamDutyEntry[K]
	) => {
		setEntries((list) => {
			const updatedList = list.map((e) => {
				if (e.id !== id) return e;

				const updated = { ...e, [key]: value };

				// If changing activity to invigilation_duties, set invigilationType and remove classLevel
				if (key === "activity" && value === "invigilation_duties") {
					updated.invigilationType = "allotted";
					delete updated.classLevel;
				}
				// If changing activity from invigilation_duties to something else, set classLevel and remove invigilationType
				else if (
					key === "activity" &&
					e.activity === "invigilation_duties" &&
					value !== "invigilation_duties"
				) {
					updated.classLevel = "UG";
					delete updated.invigilationType;
				}

				return updated;
			});

			// Auto-create paired entry for invigilation duties ONLY when changing activity to invigilation_duties
			const currentEntry = updatedList.find((e) => e.id === id);

			if (
				currentEntry?.activity === "invigilation_duties" &&
				key === "activity"
			) {
				const pairType = "performed";

				// Check if pair already exists
				const hasPair = updatedList.some(
					(e) =>
						e.activity === "invigilation_duties" &&
						e.invigilationType === pairType &&
						e.id !== id
				);

				// If no pair exists, create one
				if (!hasPair) {
					const pairedEntry: ExamDutyEntry = {
						id: crypto.randomUUID(),
						activity: "invigilation_duties",
						invigilationType: pairType,
						t1: currentEntry.t1,
						t2: currentEntry.t2,
						t3: currentEntry.t3,
					};
					updatedList.push(pairedEntry);
				}
			}

			return updatedList;
		});
	};

	return (
		<AppraisalLayout>
			<form onSubmit={onSubmitBothSections}>
				<div className="space-y-6">
					{/* Project Guidance Section */}
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">
								5. Project Guidance at UG level
							</CardTitle>
							<CardDescription>
								Enter details for total projects and students guided.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{apiScorePG !== null && (
								<div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4">
									<p className="text-sm font-medium text-success">
										✓ Section Completed - API Score: {apiScorePG}
									</p>
								</div>
							)}

							<div className="space-y-6 max-w-xl">
								<div className="space-y-2">
									<Label htmlFor="projects-guided">
										Number of Projects Guided
									</Label>
									<Input
										id="projects-guided"
										type="number"
										placeholder="e.g., 5"
										value={Number.isFinite(projectsGuided) ? projectsGuided : 0}
										onChange={(e) =>
											setProjectsGuided(Number(e.target.value) || 0)
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="students-guided">
										Number of Students Guided
									</Label>
									<Input
										id="students-guided"
										type="number"
										placeholder="e.g., 15"
										value={Number.isFinite(studentsGuided) ? studentsGuided : 0}
										onChange={(e) =>
											setStudentsGuided(Number(e.target.value) || 0)
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Exam Duties Section */}
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">
								6. Examination and Evaluation Duties
							</CardTitle>
						</CardHeader>
						<CardContent>
							{apiScoreED !== null && (
								<div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4">
									<p className="text-sm font-medium text-success">
										✓ Section Completed - API Score: {apiScoreED}
									</p>
								</div>
							)}
							<div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
								<p className="text-sm text-blue-800 dark:text-blue-200">
									<strong>Note:</strong> When you select &quot;No. of
									Examination Invigilation Duties&quot;, a paired entry
									(Allotted/Performed) will be automatically created. Both
									entries will be removed together if you delete one.
								</p>
							</div>{" "}
							<div className="space-y-4">
								{isMobile ? (
									<div className="space-y-3">
										{entries.map((e) => (
											<div
												key={e.id}
												className="rounded-lg border p-3 space-y-3"
											>
												<Select
													value={e.activity}
													onValueChange={(v: ExamDutyEntry["activity"]) =>
														updateEntry(e.id, "activity", v)
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{ACTIVITY_OPTIONS.map((opt) => (
															<SelectItem key={opt.value} value={opt.value}>
																{opt.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{e.activity === "invigilation_duties" ? (
													<Select
														value={e.invigilationType || "allotted"}
														onValueChange={(v: "allotted" | "performed") =>
															updateEntry(e.id, "invigilationType", v)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="allotted">Allotted</SelectItem>
															<SelectItem value="performed">
																Performed
															</SelectItem>
														</SelectContent>
													</Select>
												) : (
													<Select
														value={e.classLevel || "UG"}
														onValueChange={(v: "UG" | "PG") =>
															updateEntry(e.id, "classLevel", v)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="UG">UG</SelectItem>
															<SelectItem value="PG">PG</SelectItem>
														</SelectContent>
													</Select>
												)}

												<div className="grid grid-cols-3 gap-2">
													<Input
														type="number"
														value={e.t1}
														onChange={(ev) =>
															updateEntry(
																e.id,
																"t1",
																Number(ev.target.value) || 0
															)
														}
														placeholder="T1"
													/>
													<Input
														type="number"
														value={e.t2}
														onChange={(ev) =>
															updateEntry(
																e.id,
																"t2",
																Number(ev.target.value) || 0
															)
														}
														placeholder="T2"
													/>
													<Input
														type="number"
														value={e.t3}
														onChange={(ev) =>
															updateEntry(
																e.id,
																"t3",
																Number(ev.target.value) || 0
															)
														}
														placeholder="T3"
													/>
												</div>
												<div className="flex justify-end">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => removeEntry(e.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))}

										<Button
											type="button"
											variant="outline"
											onClick={addEntry}
											className="w-full"
										>
											<Plus className="h-4 w-4 mr-2" /> Add New Entry
										</Button>
									</div>
								) : (
									<div className="space-y-4">
										<div className="rounded-lg border overflow-x-auto">
											<table className="w-full text-sm">
												<thead className="bg-muted/50 text-muted-foreground">
													<tr>
														<th className="px-4 py-3 text-left">Activity</th>
														<th className="px-4 py-3 text-left">Class/Type</th>
														<th className="px-4 py-3 text-left">T1</th>
														<th className="px-4 py-3 text-left">T2</th>
														<th className="px-4 py-3 text-left">T3</th>
														<th className="px-4 py-3"></th>
													</tr>
												</thead>
												<tbody>
													{entries.map((e) => (
														<tr key={e.id} className="border-t align-top">
															<td className="px-4 py-3 w-[240px]">
																<Select
																	value={e.activity}
																	onValueChange={(
																		v: ExamDutyEntry["activity"]
																	) => updateEntry(e.id, "activity", v)}
																>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		{ACTIVITY_OPTIONS.map((opt) => (
																			<SelectItem
																				key={opt.value}
																				value={opt.value}
																			>
																				{opt.label}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</td>
															<td className="px-4 py-3 w-[120px]">
																{e.activity === "invigilation_duties" ? (
																	<Select
																		value={e.invigilationType || "allotted"}
																		onValueChange={(
																			v: "allotted" | "performed"
																		) =>
																			updateEntry(e.id, "invigilationType", v)
																		}
																	>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="allotted">
																				Allotted
																			</SelectItem>
																			<SelectItem value="performed">
																				Performed
																			</SelectItem>
																		</SelectContent>
																	</Select>
																) : (
																	<Select
																		value={e.classLevel || "UG"}
																		onValueChange={(v: "UG" | "PG") =>
																			updateEntry(e.id, "classLevel", v)
																		}
																	>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="UG">UG</SelectItem>
																			<SelectItem value="PG">PG</SelectItem>
																		</SelectContent>
																	</Select>
																)}
															</td>
															<td className="px-4 py-3 w-[120px]">
																<Input
																	type="number"
																	value={e.t1}
																	onChange={(ev) =>
																		updateEntry(
																			e.id,
																			"t1",
																			Number(ev.target.value) || 0
																		)
																	}
																/>
															</td>
															<td className="px-4 py-3 w-[120px]">
																<Input
																	type="number"
																	value={e.t2}
																	onChange={(ev) =>
																		updateEntry(
																			e.id,
																			"t2",
																			Number(ev.target.value) || 0
																		)
																	}
																/>
															</td>
															<td className="px-4 py-3 w-[120px]">
																<Input
																	type="number"
																	value={e.t3}
																	onChange={(ev) =>
																		updateEntry(
																			e.id,
																			"t3",
																			Number(ev.target.value) || 0
																		)
																	}
																/>
															</td>
															<td className="px-2 py-3 text-right">
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
													))}
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
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Submit and Navigation Buttons */}
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
							{isSubmitting ? "Submitting..." : "Submit Both Sections"}
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
				</div>
			</form>
		</AppraisalLayout>
	);
}
