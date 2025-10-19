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
	ResearchProjectRole,
	ResearchProjectStatus,
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
			amountSanctioned: 0,
			role: "Chief Investigator",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "research-projects"
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
					title: e.title,
					sponsoringAgency: e.sponsoringAgency,
					duration: e.duration,
					sanctionDate: e.sanctionDate,
					status: e.status,
					amountSanctioned: Number(e.amountSanctioned) || 0,
					role: e.role,
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
				amountSanctioned: 0,
				role: "Co-Investigator",
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
								<CardContent className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2 md:col-span-2">
										<Label>Title of Project / Consultancy</Label>
										<Input
											value={entry.title}
											onChange={(e) =>
												updateEntry(entry.id, "title", e.target.value)
											}
											required
										/>
									</div>

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
											onValueChange={(v: ResearchProjectStatus) =>
												updateEntry(entry.id, "status", v)
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
										<Label>Amount Sanctioned (USD)</Label>
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
										/>
									</div>

									<div className="space-y-2">
										<Label>Role</Label>
										<Select
											value={entry.role}
											onValueChange={(v: ResearchProjectRole) =>
												updateEntry(entry.id, "role", v)
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Chief Investigator">
													Chief Investigator
												</SelectItem>
												<SelectItem value="Co-Investigator">
													Co-Investigator
												</SelectItem>
											</SelectContent>
										</Select>
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
