"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
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
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { ReadingMaterialEntry, ReadingMaterialSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ReadingMaterialPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<ReadingMaterialEntry[]>([
		{
			id: crypto.randomUUID(),
			courseCode: "",
			consulted: "",
			prescribed: "",
			additional: "",
			selfAssessedApi: 0,
			hodRemarks: "Pending",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "reading-material"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("readingMaterial") as
			| ReadingMaterialSection
			| undefined;
		if (existing) {
			setApiScore(existing.apiScore ?? null);
			if (existing.entries?.length) {
				setEntries(
					existing.entries.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
						hodRemarks: e.hodRemarks ?? "Approved",
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
				courseCode: "",
				consulted: "",
				prescribed: "",
				additional: "",
				selfAssessedApi: 0,
				hodRemarks: "Pending",
			},
		]);
	};

	const removeEntry = (id: string) => {
		setEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	};

	const updateEntry = <K extends keyof ReadingMaterialEntry>(
		id: string,
		key: K,
		value: ReadingMaterialEntry[K]
	) => {
		setEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const payload: ReadingMaterialSection = { entries, apiScore: null };
			const result = await simulateApiCall("reading-material", payload);
			updateSectionData("readingMaterial", payload, result.score);
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
						4. Reading / Instructional Material Consulted
					</CardTitle>
					<CardDescription>
						...and additional Knowledge Resources provided to Students
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
						<div className="rounded-lg border overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-muted/50 text-muted-foreground">
									<tr>
										<th className="px-4 py-3 text-left">Course Code</th>
										<th className="px-4 py-3 text-left">
											Knowledge Resources Consulted
										</th>
										<th className="px-4 py-3 text-left">
											Knowledge Resources Prescribed
										</th>
										<th className="px-4 py-3 text-left">
											Additional Resources Provided
										</th>
										<th className="px-4 py-3"></th>
									</tr>
								</thead>
								<tbody>
									{entries.map((e) => (
										<tr key={e.id} className="border-t align-top">
											<td className="px-4 py-3 w-[140px]">
												<Input
													value={e.courseCode}
													onChange={(ev) =>
														updateEntry(e.id, "courseCode", ev.target.value)
													}
													placeholder="CS101"
												/>
											</td>
											<td className="px-4 py-3 min-w-[280px]">
												<Textarea
													rows={3}
													value={e.consulted}
													onChange={(ev) =>
														updateEntry(e.id, "consulted", ev.target.value)
													}
													placeholder="Textbooks, online resources..."
												/>
											</td>
											<td className="px-4 py-3 min-w-[280px]">
												<Textarea
													rows={3}
													value={e.prescribed}
													onChange={(ev) =>
														updateEntry(e.id, "prescribed", ev.target.value)
													}
													placeholder="Prescribed reading list"
												/>
											</td>
											<td className="px-4 py-3 min-w-[280px]">
												<Textarea
													rows={3}
													value={e.additional}
													onChange={(ev) =>
														updateEntry(e.id, "additional", ev.target.value)
													}
													placeholder="Lecture notes, examples, links..."
												/>
											</td>
											<td className="px-2 py-3 text-right">
												<Button
													type="button"
													size="icon"
													variant="ghost"
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
