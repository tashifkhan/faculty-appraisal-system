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
import { ResearchPaperEntry } from "@/lib/types";
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
			authors: "",
			titleAndReference: "",
			publicationType: "IJ",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "research-papers"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existingData = getSectionData("researchPapers") as any;
		if (existingData && existingData.entries?.length > 0) {
			setEntries(
				existingData.entries.map((e: any) => {
					const { apiScore, hodRemarks, ...entryData } = e;
					return {
						...entryData,
						id: entryData.id || crypto.randomUUID(),
					} as ResearchPaperEntry;
				})
			);
			setApiScore(existingData.entries[0]?.apiScore || null);
		}
	}, []);

	const addEntry = () => {
		setEntries([
			...entries,
			{
				id: crypto.randomUUID(),
				authors: "",
				titleAndReference: "",
				publicationType: "IJ",
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
		value: string
	) => {
		setEntries(
			entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
		);
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const data = { entries };
			const result = await simulateApiCall("research-papers", data);
			updateSectionData("researchPapers", data as any, result.score);
			setApiScore(result.score);
			toast.success(result.message);
		} catch (error) {
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
										<Label>Authors (in order)</Label>
										<Input
											value={entry.authors}
											onChange={(e) =>
												updateEntry(entry.id, "authors", e.target.value)
											}
											placeholder="e.g., John Doe, Jane Smith, Robert Lee"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label>Title and Complete Reference (IEEE Style)</Label>
										<Textarea
											value={entry.titleAndReference}
											onChange={(e) =>
												updateEntry(
													entry.id,
													"titleAndReference",
													e.target.value
												)
											}
											placeholder='e.g., "Machine Learning in Healthcare," IEEE Trans. on Medical Imaging, vol. 42, no. 5, pp. 1234-1245, May 2024.'
											rows={4}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label>Publication Type</Label>
										<Select
											value={entry.publicationType}
											onValueChange={(
												value: "IJ" | "NJ" | "IC" | "PN" | "OA"
											) => updateEntry(entry.id, "publicationType", value)}
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
