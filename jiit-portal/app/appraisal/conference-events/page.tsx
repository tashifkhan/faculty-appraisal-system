"use client";

import { useEffect, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ConferenceEntry } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import AppraisalLayout from "@/components/AppraisalLayout";

export default function ConferenceEvents() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<ConferenceEntry[]>([
		{
			id: crypto.randomUUID(),
			title: "",
			datesDuration: "",
			sponsoringAgency: "",
			organisationPlace: "",
			attendedOrganized: "attended",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "conference-events"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existingData = getSectionData("conferenceEvents") as any;
		if (existingData && existingData.entries?.length > 0) {
			setEntries(
				existingData.entries.map((e: any) => {
					const { apiScore, hodRemarks, ...entryData } = e;
					return {
						...entryData,
						id: entryData.id || crypto.randomUUID(),
					} as ConferenceEntry;
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
				title: "",
				datesDuration: "",
				sponsoringAgency: "",
				organisationPlace: "",
				attendedOrganized: "attended",
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
		field: keyof ConferenceEntry,
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
			const result = await simulateApiCall("conference-events", data);
			updateSectionData("conferenceEvents", data as any, result.score);
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
					<CardTitle className="text-2xl">2. Conference and All</CardTitle>
					<CardDescription>
						List conferences, workshops, and seminars attended or organized
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
						{entries.map((entry, index) => (
							<Card key={entry.id} className="border-2">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">Entry {index + 1}</CardTitle>
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
										<Label>Title</Label>
										<Input
											value={entry.title}
											onChange={(e) =>
												updateEntry(entry.id, "title", e.target.value)
											}
											placeholder="e.g., International Conference on AI"
											required
										/>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label>Dates/Duration</Label>
											<Input
												value={entry.datesDuration}
												onChange={(e) =>
													updateEntry(entry.id, "datesDuration", e.target.value)
												}
												placeholder="e.g., 15-17 Jan 2024"
												required
											/>
										</div>

										<div className="space-y-2">
											<Label>Attended/Organized</Label>
											<Select
												value={entry.attendedOrganized}
												onValueChange={(value: "attended" | "organized") =>
													updateEntry(entry.id, "attendedOrganized", value)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="attended">Attended</SelectItem>
													<SelectItem value="organized">Organized</SelectItem>
												</SelectContent>
											</Select>
										</div>
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
											placeholder="e.g., IEEE, ACM, AICTE"
										/>
									</div>

									<div className="space-y-2">
										<Label>Organisation & Place</Label>
										<Input
											value={entry.organisationPlace}
											onChange={(e) =>
												updateEntry(
													entry.id,
													"organisationPlace",
													e.target.value
												)
											}
											placeholder="e.g., IIT Delhi, New Delhi"
										/>
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
							Add Another Entry
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
