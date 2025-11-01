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
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ConferenceEntry, ConferenceSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { toast } from "sonner";
import {
	ArrowLeft,
	ArrowRight,
	Plus,
	Save,
	Trash2,
	CalendarIcon,
} from "lucide-react";
import AppraisalLayout from "@/components/AppraisalLayout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
			programType: "conference",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "11-conference-events"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existingData = getSectionData("conferenceEvents");
		if (existingData && existingData.entries?.length > 0) {
			setEntries(
				existingData.entries.map((e) => ({
					id: e.id || crypto.randomUUID(),
					title: e.title,
					datesDuration: e.datesDuration,
					sponsoringAgency: e.sponsoringAgency,
					organisationPlace: e.organisationPlace,
					attendedOrganized: e.attendedOrganized,
					programType: e.programType || "conference",
					isChiefOrganiser: e.isChiefOrganiser,
				}))
			);
			setApiScore(existingData.apiScore ?? null);
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
				programType: "conference",
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
		field: keyof ConferenceEntry | string,
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
			const data: ConferenceSection = { entries, apiScore: null };
			const result = await simulateApiCall("conference-events", data);
			updateSectionData("conferenceEvents", data, result.score);
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

									<div className="space-y-2">
										<Label>Program Type</Label>
										<Select
											value={entry.programType || "conference"}
											onValueChange={(
												value:
													| "course"
													| "program"
													| "seminar"
													| "conference"
													| "workshop"
											) => updateEntry(entry.id, "programType", value)}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="course">Course</SelectItem>
												<SelectItem value="program">Program</SelectItem>
												<SelectItem value="seminar">Seminar</SelectItem>
												<SelectItem value="conference">Conference</SelectItem>
												<SelectItem value="workshop">Workshop</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										{(() => {
											const parts = entry.datesDuration
												? entry.datesDuration.split(" | ")
												: ["", ""];
											const start = parts[0] ?? "";
											const end = parts[1] ?? "";
											const startDate = start ? new Date(start) : undefined;
											const endDate = end ? new Date(end) : undefined;

											// local helper to ensure a date is valid before formatting/comparing
											const isValidDate = (d: Date | undefined): d is Date =>
												d instanceof Date && !isNaN(d.getTime());

											return (
												<>
													<div className="space-y-2">
														<Label>Start Date</Label>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="outline"
																	className={cn(
																		"w-full justify-start text-left font-normal",
																		!startDate && "text-muted-foreground"
																	)}
																>
																	<CalendarIcon className="mr-2 h-4 w-4" />
																	{isValidDate(startDate) ? (
																		format(startDate, "PPP")
																	) : (
																		<span>Pick a date</span>
																	)}
																</Button>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-0"
																align="start"
															>
																<Calendar
																	mode="single"
																	selected={
																		isValidDate(startDate)
																			? startDate
																			: undefined
																	}
																	onSelect={(date) => {
																		const newStart = date
																			? format(date, "yyyy-MM-dd")
																			: "";
																		updateEntry(
																			entry.id,
																			"datesDuration",
																			`${newStart} | ${end}`
																		);
																	}}
																	initialFocus
																/>
															</PopoverContent>
														</Popover>
													</div>

													<div className="space-y-2">
														<Label>End Date</Label>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant="outline"
																	className={cn(
																		"w-full justify-start text-left font-normal",
																		!endDate && "text-muted-foreground"
																	)}
																>
																	<CalendarIcon className="mr-2 h-4 w-4" />
																	{isValidDate(endDate) ? (
																		format(endDate, "PPP")
																	) : (
																		<span>Pick a date</span>
																	)}
																</Button>
															</PopoverTrigger>
															<PopoverContent
																className="w-auto p-0"
																align="start"
															>
																<Calendar
																	mode="single"
																	selected={
																		isValidDate(endDate) ? endDate : undefined
																	}
																	onSelect={(date) => {
																		const newEnd = date
																			? format(date, "yyyy-MM-dd")
																			: "";
																		updateEntry(
																			entry.id,
																			"datesDuration",
																			`${start} | ${newEnd}`
																		);
																	}}
																	disabled={(date) =>
																		isValidDate(startDate)
																			? date < startDate
																			: false
																	}
																	initialFocus
																/>
															</PopoverContent>
														</Popover>
													</div>
												</>
											);
										})()}

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

											{entry.attendedOrganized === "organized" && (
												<div className="pt-2">
													<Label>Are you the Chief Organizer?</Label>
													<div className="flex items-center space-x-4 mt-2">
														<label className="inline-flex items-center space-x-2">
															<input
																type="radio"
																name={`chief-${entry.id}`}
																value="yes"
																checked={entry.isChiefOrganiser === "yes"}
																onChange={(e) =>
																	updateEntry(
																		entry.id,
																		"isChiefOrganiser",
																		e.target.value
																	)
																}
															/>
															<span>Yes</span>
														</label>

														<label className="inline-flex items-center space-x-2">
															<input
																type="radio"
																name={`chief-${entry.id}`}
																value="no"
																checked={entry.isChiefOrganiser !== "yes"}
																onChange={(e) =>
																	updateEntry(
																		entry.id,
																		"isChiefOrganiser",
																		e.target.value
																	)
																}
															/>
															<span>No</span>
														</label>
													</div>
												</div>
											)}
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
