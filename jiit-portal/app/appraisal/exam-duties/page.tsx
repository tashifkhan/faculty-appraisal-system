"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ExamDutiesSection, ExamDutyEntry } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ACTIVITY_OPTIONS: { value: ExamDutyEntry["activity"]; label: string }[] =
	[
		{ value: "qp_set", label: "No. of Q. Papers Set" },
		{ value: "ab_evaluated", label: "No. of A/B Evaluated" },
		{ value: "practical_conducted", label: "No. of Practical Exams Conducted" },
	];

export default function ExamDutiesPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
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
		(s) => s.id === "exam-duties"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("examDuties") as
			| ExamDutiesSection
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
				activity: "qp_set",
				classLevel: "UG",
				t1: 0,
				t2: 0,
				t3: 0,
			},
		]);
	};

	const removeEntry = (id: string) => {
		setEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	};

	const updateEntry = <K extends keyof ExamDutyEntry>(
		id: string,
		key: K,
		value: ExamDutyEntry[K]
	) => {
		setEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);
	};

	const sectionPayload: ExamDutiesSection = useMemo(
		() => ({ entries, apiScore: null }),
		[entries]
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall("exam-duties", sectionPayload);
			updateSectionData("examDuties", sectionPayload, result.score);
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
						6. Examination and Evaluation Duties
					</CardTitle>
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
										<th className="px-4 py-3 text-left">Activity</th>
										<th className="px-4 py-3 text-left">Class</th>
										<th className="px-4 py-3 text-left">T1</th>
										<th className="px-4 py-3 text-left">T2</th>
										<th className="px-4 py-3 text-left">T3</th>
										<th className="px-4 py-3"></th>
									</tr>
								</thead>
								<tbody>
									{entries.map((e) => {
										const tsum =
											(Number(e.t1) || 0) +
											(Number(e.t2) || 0) +
											(Number(e.t3) || 0);
										const weight =
											e.activity === "qp_set"
												? 1
												: e.activity === "ab_evaluated"
												? 0.02
												: 0.5;
										// rowScore would be computed by backend scoring; omit local unused var
										return (
											<tr key={e.id} className="border-t align-top">
												<td className="px-4 py-3 w-[240px]">
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
												</td>
												<td className="px-4 py-3 w-[120px]">
													<Select
														value={e.classLevel}
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
