"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { CourseEntry, LecturesTutorialsSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import AppraisalLayout from "@/components/AppraisalLayout";

// Local row type including extra fields maintained in this page
type Row = CourseEntry & { apiScore: number | null; hodRemarks?: string };

export default function LecturesTutorialsPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<"odd" | "even">("odd");
	const [apiScore, setApiScore] = useState<number | null>(null);

	const [oddSemester, setOddSemester] = useState<Row[]>([
		{
			id: crypto.randomUUID(),
			courseCode: "",
			courseTitle: "",
			contactHoursPerWeek: "",
			scheduledHours: 0,
			engagedHours: 0,
			apiScore: null,
			hodRemarks: "Pending",
		},
	]);

	const [evenSemester, setEvenSemester] = useState<Row[]>([
		{
			id: crypto.randomUUID(),
			courseCode: "",
			courseTitle: "",
			contactHoursPerWeek: "",
			scheduledHours: 0,
			engagedHours: 0,
			apiScore: null,
			hodRemarks: "Pending",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "12-1-lectures-tutorials"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("lecturesTutorials") as
			| LecturesTutorialsSection
			| undefined;
		if (existing) {
			setApiScore(existing.apiScore ?? null);
			setOddSemester(
				(existing.oddSemester || []).map((c) => ({
					...c,
					id: c.id || crypto.randomUUID(),
					apiScore: c.apiScore ?? null,
					hodRemarks: c.hodRemarks ?? "Pending",
				}))
			);
			setEvenSemester(
				(existing.evenSemester || []).map((c) => ({
					...c,
					id: c.id || crypto.randomUUID(),
					apiScore: c.apiScore ?? null,
					hodRemarks: c.hodRemarks ?? "Pending",
				}))
			);
		}
	}, []);

	const addRow = (semester: "odd" | "even") => {
		const row: Row = {
			id: crypto.randomUUID(),
			courseCode: "",
			courseTitle: "",
			contactHoursPerWeek: "",
			scheduledHours: 0,
			engagedHours: 0,
			apiScore: null,
			hodRemarks: "Pending",
		};
		if (semester === "odd") setOddSemester((s) => [...s, row]);
		else setEvenSemester((s) => [...s, row]);
	};

	const removeRow = (semester: "odd" | "even", id: string) => {
		if (semester === "odd") {
			setOddSemester((rows) =>
				rows.length > 1 ? rows.filter((r) => r.id !== id) : rows
			);
		} else {
			setEvenSemester((rows) =>
				rows.length > 1 ? rows.filter((r) => r.id !== id) : rows
			);
		}
	};

	const updateRow = <K extends keyof Row>(
		semester: "odd" | "even",
		id: string,
		field: K,
		value: Row[K]
	) => {
		const updater = (rows: Row[]) =>
			rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
		if (semester === "odd") setOddSemester(updater);
		else setEvenSemester(updater);
	};

	const formData: LecturesTutorialsSection = useMemo(
		() => ({ oddSemester, evenSemester, apiScore: null }),
		[oddSemester, evenSemester]
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall("lectures-tutorials", formData);
			updateSectionData("lecturesTutorials", formData, result.score);
			setApiScore(result.score);
			toast.success(result.message);
		} catch {
			toast.error("Failed to submit section");
		} finally {
			setIsSubmitting(false);
		}
	};

	const Table = ({ semester }: { semester: "odd" | "even" }) => {
		const rows = semester === "odd" ? oddSemester : evenSemester;
		return (
			<div className="rounded-lg border overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="bg-muted/50 text-muted-foreground">
						<tr>
							<th className="px-4 py-3 text-left">Course Code</th>
							<th className="px-4 py-3 text-left">Course Title</th>
							<th className="px-4 py-3 text-center">Contact Hrs/Week</th>
							<th className="px-4 py-3 text-left">
								Total Hours (Scheduled/Engaged)
							</th>
							<th className="px-4 py-3"></th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r.id} className="border-t">
								<td className="px-4 py-2 align-top">
									<Input
										value={r.courseCode}
										onChange={(e) =>
											updateRow(semester, r.id, "courseCode", e.target.value)
										}
										placeholder="CS101"
									/>
								</td>
								<td className="px-4 py-2 align-top">
									<Input
										value={r.courseTitle}
										onChange={(e) =>
											updateRow(semester, r.id, "courseTitle", e.target.value)
										}
										placeholder="Introduction to Programming"
									/>
								</td>
								<td className="px-4 py-2 align-top">
									<Input
										value={r.contactHoursPerWeek}
										onChange={(e) =>
											updateRow(
												semester,
												r.id,
												"contactHoursPerWeek",
												e.target.value
											)
										}
										placeholder="4"
									/>
								</td>
								<td className="px-4 py-2 align-top">
									<div className="grid grid-cols-2 gap-2">
										<div>
											<Label className="text-xs">Scheduled</Label>
											<Input
												type="number"
												value={r.scheduledHours}
												onChange={(e) =>
													updateRow(
														semester,
														r.id,
														"scheduledHours",
														Number(e.target.value) || 0
													)
												}
												placeholder="60"
											/>
										</div>
										<div>
											<Label className="text-xs">Engaged</Label>
											<Input
												type="number"
												value={r.engagedHours}
												onChange={(e) =>
													updateRow(
														semester,
														r.id,
														"engagedHours",
														Number(e.target.value) || 0
													)
												}
												placeholder="60"
											/>
										</div>
									</div>
								</td>
								<td className="px-4 py-2 align-top text-right">
									<Button
										type="button"
										size="icon"
										variant="ghost"
										onClick={() => removeRow(semester, r.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<AppraisalLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						3. Lectures/Tutorials/Practicals/Projects/Seminars Conducted
					</CardTitle>
					<CardDescription>
						Fill out courses conducted in Odd and Even semesters.
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

					<div className="border-b mb-4">
						<div className="flex gap-6">
							<button
								type="button"
								onClick={() => setActiveTab("odd")}
								className={`py-2 border-b-2 px-1 text-sm font-medium ${
									activeTab === "odd"
										? "border-primary text-primary"
										: "border-transparent text-muted-foreground"
								}`}
							>
								Odd Semester
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("even")}
								className={`py-2 border-b-2 px-1 text-sm font-medium ${
									activeTab === "even"
										? "border-primary text-primary"
										: "border-transparent text-muted-foreground"
								}`}
							>
								Even Semester
							</button>
						</div>
					</div>

					<form onSubmit={onSubmit} className="space-y-4">
						{activeTab === "odd" ? (
							<Table semester="odd" />
						) : (
							<Table semester="even" />
						)}

						<Button
							type="button"
							variant="outline"
							onClick={() => addRow(activeTab)}
							className="w-full"
						>
							<Plus className="h-4 w-4 mr-2" /> Add New Course
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
