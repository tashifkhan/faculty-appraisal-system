"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
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
	IndustryExpert,
	MentorshipActivity,
	OtherContribution,
	StudentActivitiesSection,
	StudentEvent,
	TechCommunityActivity,
} from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import {
	ArrowLeft,
	ArrowRight,
	Plus,
	Save,
	Trash2,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

type RowWithMeta<T> = T & {
	id: string;
	apiScore: number | null;
	hodRemarks?: string;
};

export default function StudentActivitiesPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"A" | "B" | "C" | "D">("A");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);

	// 13A
	const [techCommunities, setTechCommunities] = useState<
		RowWithMeta<TechCommunityActivity>[]
	>([
		{
			id: crypto.randomUUID(),
			communityName: "",
			role: "",
			contributionDetails: "",
			apiScore: null,
			hodRemarks: "Pending",
		},
	]);

	// 13B
	const [studentEvents, setStudentEvents] = useState<
		RowWithMeta<StudentEvent>[]
	>([
		{
			id: crypto.randomUUID(),
			eventName: "",
			eventType: "Hackathon",
			eventDates: "",
			theme: "",
			facultyRole: "",
			description: "",
			expertsInvited: [],
			apiScore: null,
			hodRemarks: "Pending",
		},
	]);

	// 13C
	const [mentorships, setMentorships] = useState<
		RowWithMeta<MentorshipActivity>[]
	>([
		{
			id: crypto.randomUUID(),
			programName: "",
			involvementType: "Mentor",
			details: "",
			apiScore: null,
			hodRemarks: "Pending",
		},
	]);

	// 13D
	const [otherContributions, setOtherContributions] = useState<
		RowWithMeta<OtherContribution>[]
	>([
		{
			id: crypto.randomUUID(),
			title: "",
			details: "",
			apiScore: null,
			hodRemarks: "Pending",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "student-activities"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("studentActivities") as
			| StudentActivitiesSection
			| undefined;
		if (existing) {
			setApiScore(existing.apiScore ?? null);
			setTechCommunities(
				(existing.techCommunities || []).map((e) => ({
					id: (e as { id?: string }).id ?? crypto.randomUUID(),
					communityName: e.communityName,
					role: e.role,
					contributionDetails: e.contributionDetails,
					apiScore: e.apiScore ?? null,
					hodRemarks: e.hodRemarks ?? "Pending",
				})) || []
			);

			setStudentEvents(
				(existing.studentEvents || []).map((e) => ({
					id: (e as { id?: string }).id ?? crypto.randomUUID(),
					eventName: e.eventName,
					eventType: e.eventType,
					eventDates: e.eventDates,
					theme: e.theme,
					facultyRole: e.facultyRole,
					description: e.description,
					expertsInvited: (e.expertsInvited || []).map((x) => ({
						id: (x as { id?: string }).id ?? crypto.randomUUID(),
						name: x.name,
						profile: x.profile,
						company: x.company,
						emailId: x.emailId,
						cellNumber: x.cellNumber,
						startDate: x.startDate,
						endDate: x.endDate,
						durationHours: x.durationHours,
					})),
					apiScore: e.apiScore ?? null,
					hodRemarks: e.hodRemarks ?? "Pending",
				})) || []
			);

			setMentorships(
				(existing.mentorships || []).map((e) => ({
					id: (e as { id?: string }).id ?? crypto.randomUUID(),
					programName: e.programName,
					involvementType: e.involvementType,
					details: e.details,
					apiScore: e.apiScore ?? null,
					hodRemarks: e.hodRemarks ?? "Pending",
				})) || []
			);

			setOtherContributions(
				(existing.otherContributions || []).map((e) => ({
					id: (e as { id?: string }).id ?? crypto.randomUUID(),
					title: e.title,
					details: e.details,
					apiScore: e.apiScore ?? null,
					hodRemarks: e.hodRemarks ?? "Pending",
				})) || []
			);
		}
	}, []);

	const sectionPayload: StudentActivitiesSection = useMemo(
		() => ({
			techCommunities,
			studentEvents,
			mentorships,
			otherContributions,
			apiScore: null,
		}),
		[techCommunities, studentEvents, mentorships, otherContributions]
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall(
				"student-activities",
				sectionPayload
			);
			updateSectionData("studentActivities", sectionPayload, result.score);
			setApiScore(result.score);
			toast.success(result.message);
		} catch {
			toast.error("Failed to submit section");
		} finally {
			setIsSubmitting(false);
		}
	};

	const addRow = <T,>(
		setter: React.Dispatch<React.SetStateAction<RowWithMeta<T>[]>>,
		row: RowWithMeta<T>
	) => setter((list) => [...list, row]);
	const removeRow = <T,>(
		setter: React.Dispatch<React.SetStateAction<RowWithMeta<T>[]>>,
		id: string
	) =>
		setter((list) =>
			list.length > 1 ? list.filter((x) => x.id !== id) : list
		);
	const updateRow = <T, K extends keyof RowWithMeta<T>>(
		setter: React.Dispatch<React.SetStateAction<RowWithMeta<T>[]>>,
		id: string,
		field: K,
		value: RowWithMeta<T>[K]
	) =>
		setter((list) =>
			list.map((x) => (x.id === id ? { ...x, [field]: value } : x))
		);

	const addExpert = (eventId: string) => {
		setStudentEvents((events) =>
			events.map((ev) =>
				ev.id === eventId
					? {
							...ev,
							expertsInvited: [
								...ev.expertsInvited,
								{
									id: crypto.randomUUID(),
									name: "",
									profile: "",
									company: "",
									emailId: "",
									cellNumber: "",
									startDate: "",
									endDate: "",
									durationHours: 0,
								} as IndustryExpert,
							],
					  }
					: ev
			)
		);
	};
	const removeExpert = (eventId: string, expertId: string) => {
		setStudentEvents((events) =>
			events.map((ev) =>
				ev.id === eventId
					? {
							...ev,
							expertsInvited: ev.expertsInvited.filter(
								(ex) => ex.id !== expertId
							),
					  }
					: ev
			)
		);
	};
	const updateExpert = <K extends keyof IndustryExpert>(
		eventId: string,
		expertId: string,
		field: K,
		value: IndustryExpert[K]
	) => {
		setStudentEvents((events) =>
			events.map((ev) =>
				ev.id === eventId
					? {
							...ev,
							expertsInvited: ev.expertsInvited.map((ex) =>
								ex.id === expertId ? { ...ex, [field]: value } : ex
							),
					  }
					: ev
			)
		);
	};

	const EventCard = ({ ev }: { ev: RowWithMeta<StudentEvent> }) => {
		const [open, setOpen] = useState(true);
		return (
			<div className="rounded-lg border p-4 space-y-3">
				<div className="flex items-center justify-between">
					<h4 className="font-semibold text-base">Event</h4>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setOpen((o) => !o)}
						>
							{open ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => removeRow(setStudentEvents, ev.id)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
				{open && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label className="text-xs">Event Name</Label>
							<Input
								value={ev.eventName}
								onChange={(e) =>
									updateRow(
										setStudentEvents,
										ev.id,
										"eventName",
										e.target.value
									)
								}
								placeholder="Bit-Box 2.0"
							/>
						</div>
						<div>
							<Label className="text-xs">Event Type</Label>
							<Input
								value={ev.eventType}
								onChange={(e) =>
									updateRow(
										setStudentEvents,
										ev.id,
										"eventType",
										e.target.value
									)
								}
								placeholder="Hackathon"
							/>
						</div>
						<div>
							<Label className="text-xs">Dates</Label>
							<Input
								value={ev.eventDates}
								onChange={(e) =>
									updateRow(
										setStudentEvents,
										ev.id,
										"eventDates",
										e.target.value
									)
								}
								placeholder="2024-03-15 to 2024-03-16"
							/>
						</div>
						<div>
							<Label className="text-xs">Theme</Label>
							<Input
								value={ev.theme}
								onChange={(e) =>
									updateRow(setStudentEvents, ev.id, "theme", e.target.value)
								}
								placeholder="AI for Social Good"
							/>
						</div>
						<div>
							<Label className="text-xs">Faculty Role</Label>
							<Input
								value={ev.facultyRole}
								onChange={(e) =>
									updateRow(
										setStudentEvents,
										ev.id,
										"facultyRole",
										e.target.value
									)
								}
								placeholder="Organizer"
							/>
						</div>
						<div className="md:col-span-2">
							<Label className="text-xs">Description</Label>
							<Input
								value={ev.description}
								onChange={(e) =>
									updateRow(
										setStudentEvents,
										ev.id,
										"description",
										e.target.value
									)
								}
								placeholder="Describe the event"
							/>
						</div>
					</div>
				)}

				{/* Experts table */}
				<div className="mt-3">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">Invited Experts</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => addExpert(ev.id)}
						>
							<Plus className="h-4 w-4 mr-1" /> Add Expert
						</Button>
					</div>
					<div className="mt-2 overflow-x-auto rounded-lg border">
						<table className="w-full text-sm">
							<thead className="bg-muted/50 text-muted-foreground">
								<tr>
									<th className="px-3 py-2 text-left">Name</th>
									<th className="px-3 py-2 text-left">Profile</th>
									<th className="px-3 py-2 text-left">Company</th>
									<th className="px-3 py-2 text-left">Email</th>
									<th className="px-3 py-2 text-left">Cell</th>
									<th className="px-3 py-2 text-left">Start</th>
									<th className="px-3 py-2 text-left">End</th>
									<th className="px-3 py-2 text-left">Hours</th>
									<th className="px-3 py-2"></th>
								</tr>
							</thead>
							<tbody>
								{ev.expertsInvited?.map((ex: IndustryExpert) => {
									const id = ex.id;
									return (
										<tr key={id} className="border-t">
											<td className="px-3 py-2">
												<Input
													value={ex.name}
													onChange={(e) =>
														updateExpert(ev.id, id, "name", e.target.value)
													}
													placeholder="Expert Name"
												/>
											</td>
											<td className="px-3 py-2">
												<Input
													value={ex.profile}
													onChange={(e) =>
														updateExpert(ev.id, id, "profile", e.target.value)
													}
													placeholder="Profile"
												/>
											</td>
											<td className="px-3 py-2">
												<Input
													value={ex.company}
													onChange={(e) =>
														updateExpert(ev.id, id, "company", e.target.value)
													}
													placeholder="Company"
												/>
											</td>
											<td className="px-3 py-2">
												<Input
													type="email"
													value={ex.emailId}
													onChange={(e) =>
														updateExpert(ev.id, id, "emailId", e.target.value)
													}
													placeholder="Email"
												/>
											</td>
											<td className="px-3 py-2">
												<Input
													value={ex.cellNumber}
													onChange={(e) =>
														updateExpert(
															ev.id,
															id,
															"cellNumber",
															e.target.value
														)
													}
													placeholder="Cell"
												/>
											</td>
											<td className="px-3 py-2">
												<Input
													value={ex.startDate}
													onChange={(e) =>
														updateExpert(ev.id, id, "startDate", e.target.value)
													}
													placeholder="YYYY-MM-DD"
												/>
											</td>
											<td className="px-3 py-2">
												<Input
													value={ex.endDate}
													onChange={(e) =>
														updateExpert(ev.id, id, "endDate", e.target.value)
													}
													placeholder="YYYY-MM-DD"
												/>
											</td>
											<td className="px-3 py-2">
												<Input
													type="number"
													value={ex.durationHours}
													onChange={(e) =>
														updateExpert(
															ev.id,
															id,
															"durationHours",
															Number(e.target.value) || 0
														)
													}
													placeholder="1"
												/>
											</td>
											<td className="px-3 py-2 text-right">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => removeExpert(ev.id, id)}
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
				</div>
			</div>
		);
	};

	return (
		<AppraisalLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						7. Contribution/Participation in Students Extra & Co‑Curricular
						Activities
					</CardTitle>
					<CardDescription>
						Fill the four sub-sections below. This mirrors the PDF point 13 A–D.
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

					{/* Tabs */}
					<div className="border-b mb-4">
						<div className="flex gap-6">
							{(
								[
									["A", "Tech Communities / Hubs"],
									["B", "Organized Events / Hackathons"],
									["C", "Mentorship & Internal Competitions"],
									["D", "Other Contributions"],
								] as const
							).map(([id, label]) => (
								<button
									key={id}
									type="button"
									onClick={() => setActiveTab(id)}
									className={`py-2 border-b-2 px-1 text-sm font-medium ${
										activeTab === id
											? "border-primary text-primary"
											: "border-transparent text-muted-foreground"
									}`}
								>
									{label}
								</button>
							))}
						</div>
					</div>

					<form onSubmit={onSubmit} className="space-y-6">
						{/* 13A */}
						{activeTab === "A" && (
							<div className="space-y-3">
								{techCommunities.map((r) => (
									<div key={r.id} className="rounded-lg border p-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<Label className="text-xs">
													Name of Club/Community
												</Label>
												<Input
													value={r.communityName}
													onChange={(e) =>
														updateRow(
															setTechCommunities,
															r.id,
															"communityName",
															e.target.value
														)
													}
													placeholder="e.g., GDG Hub"
												/>
											</div>
											<div>
												<Label className="text-xs">Role / Position</Label>
												<Input
													value={r.role}
													onChange={(e) =>
														updateRow(
															setTechCommunities,
															r.id,
															"role",
															e.target.value
														)
													}
													placeholder="Faculty Coordinator"
												/>
											</div>
											<div className="md:col-span-2">
												<Label className="text-xs">Details of Activities</Label>
												<Input
													value={r.contributionDetails}
													onChange={(e) =>
														updateRow(
															setTechCommunities,
															r.id,
															"contributionDetails",
															e.target.value
														)
													}
													placeholder="Describe activities organized"
												/>
											</div>
										</div>
										<div className="mt-2 text-right">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeRow(setTechCommunities, r.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										addRow(setTechCommunities, {
											id: crypto.randomUUID(),
											communityName: "",
											role: "",
											contributionDetails: "",
											apiScore: null,
											hodRemarks: "Pending",
										})
									}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" /> Add Activity
								</Button>
							</div>
						)}

						{/* 13B */}
						{activeTab === "B" && (
							<div className="space-y-3">
								{studentEvents.map((ev) => (
									<EventCard key={ev.id} ev={ev} />
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										addRow(setStudentEvents, {
											id: crypto.randomUUID(),
											eventName: "",
											eventType: "Hackathon",
											eventDates: "",
											theme: "",
											facultyRole: "",
											description: "",
											expertsInvited: [],
											apiScore: null,
											hodRemarks: "Pending",
										})
									}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" /> Add Event
								</Button>
							</div>
						)}

						{/* 13C */}
						{activeTab === "C" && (
							<div className="space-y-3">
								{mentorships.map((m) => (
									<div key={m.id} className="rounded-lg border p-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<Label className="text-xs">Program Name</Label>
												<Input
													value={m.programName}
													onChange={(e) =>
														updateRow(
															setMentorships,
															m.id,
															"programName",
															e.target.value
														)
													}
													placeholder="Smart India Hackathon"
												/>
											</div>
											<div>
												<Label className="text-xs">Involvement Type</Label>
												<Input
													value={m.involvementType}
													onChange={(e) =>
														updateRow(
															setMentorships,
															m.id,
															"involvementType",
															e.target.value
														)
													}
													placeholder="Mentor"
												/>
											</div>
											<div className="md:col-span-2">
												<Label className="text-xs">Details</Label>
												<Input
													value={m.details}
													onChange={(e) =>
														updateRow(
															setMentorships,
															m.id,
															"details",
															e.target.value
														)
													}
													placeholder="Provide details"
												/>
											</div>
										</div>
										<div className="mt-2 text-right">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeRow(setMentorships, m.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										addRow(setMentorships, {
											id: crypto.randomUUID(),
											programName: "",
											involvementType: "Mentor",
											details: "",
											apiScore: null,
											hodRemarks: "Pending",
										})
									}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" /> Add Mentorship
								</Button>
							</div>
						)}

						{/* 13D */}
						{activeTab === "D" && (
							<div className="space-y-3">
								{otherContributions.map((o) => (
									<div key={o.id} className="rounded-lg border p-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<Label className="text-xs">Title</Label>
												<Input
													value={o.title}
													onChange={(e) =>
														updateRow(
															setOtherContributions,
															o.id,
															"title",
															e.target.value
														)
													}
													placeholder="Activity Title"
												/>
											</div>
											<div className="md:col-span-2">
												<Label className="text-xs">Details</Label>
												<Input
													value={o.details}
													onChange={(e) =>
														updateRow(
															setOtherContributions,
															o.id,
															"details",
															e.target.value
														)
													}
													placeholder="Description"
												/>
											</div>
										</div>
										<div className="mt-2 text-right">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeRow(setOtherContributions, o.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										addRow(setOtherContributions, {
											id: crypto.randomUUID(),
											title: "",
											details: "",
											apiScore: null,
											hodRemarks: "Pending",
										})
									}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" /> Add Contribution
								</Button>
							</div>
						)}

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
