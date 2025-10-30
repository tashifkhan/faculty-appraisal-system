"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
	SocietyActivity,
	DepartmentalActivity,
	InstituteActivity,
	LectureActivity,
	ArticleActivity,
	StudentActivitiesSection,
} from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function StudentActivitiesPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"A" | "B" | "C" | "D" | "E">("A");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);

	// Section A: Societies/Hubs
	const [sectionA, setSectionA] = useState<SocietyActivity[]>([
		{
			id: crypto.randomUUID(),
			nameOfClub: "",
			playedLeadRole: false,
			detailsOfActivities: "",
		},
	]);

	// Section B: Departmental Activities
	const [sectionB, setSectionB] = useState<DepartmentalActivity[]>([
		{
			id: crypto.randomUUID(),
			role: "",
			detailsOfActivities: "",
		},
	]);

	// Section C: Institute Activities
	const [sectionC, setSectionC] = useState<InstituteActivity[]>([
		{
			id: crypto.randomUUID(),
			positionType: "",
			detailsOfActivities: "",
		},
	]);

	// Section D: Lectures Delivered
	const [sectionD, setSectionD] = useState<LectureActivity[]>([
		{
			id: crypto.randomUUID(),
			nature: "",
			detailsOfActivities: "",
		},
	]);

	// Section E: Articles/Reports Written
	const [sectionE, setSectionE] = useState<ArticleActivity[]>([
		{
			id: crypto.randomUUID(),
			points: 0,
			detailsOfActivities: "",
		},
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "13-student-activities"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("studentActivities") as
			| StudentActivitiesSection
			| undefined;
		if (existing) {
			setApiScore(existing.apiScore ?? null);
			if (existing.A?.length) {
				setSectionA(
					existing.A.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
			if (existing.B?.length) {
				setSectionB(
					existing.B.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
			if (existing.C?.length) {
				setSectionC(
					existing.C.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
			if (existing.D?.length) {
				setSectionD(
					existing.D.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
			if (existing.E?.length) {
				setSectionE(
					existing.E.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
		}
	}, []);

	// Section A CRUD operations
	const addSectionA = () =>
		setSectionA((list) => [
			...list,
			{
				id: crypto.randomUUID(),
				nameOfClub: "",
				playedLeadRole: false,
				detailsOfActivities: "",
			},
		]);
	const removeSectionA = (id: string) =>
		setSectionA((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateSectionA = <K extends keyof SocietyActivity>(
		id: string,
		key: K,
		value: SocietyActivity[K]
	) =>
		setSectionA((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);

	// Section B CRUD operations
	const addSectionB = () =>
		setSectionB((list) => [
			...list,
			{
				id: crypto.randomUUID(),
				role: "",
				detailsOfActivities: "",
			},
		]);
	const removeSectionB = (id: string) =>
		setSectionB((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateSectionB = <K extends keyof DepartmentalActivity>(
		id: string,
		key: K,
		value: DepartmentalActivity[K]
	) =>
		setSectionB((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);

	// Section C CRUD operations
	const addSectionC = () =>
		setSectionC((list) => [
			...list,
			{
				id: crypto.randomUUID(),
				positionType: "",
				detailsOfActivities: "",
			},
		]);
	const removeSectionC = (id: string) =>
		setSectionC((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateSectionC = <K extends keyof InstituteActivity>(
		id: string,
		key: K,
		value: InstituteActivity[K]
	) =>
		setSectionC((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);

	// Section D CRUD operations
	const addSectionD = () =>
		setSectionD((list) => [
			...list,
			{
				id: crypto.randomUUID(),
				nature: "",
				detailsOfActivities: "",
			},
		]);
	const removeSectionD = (id: string) =>
		setSectionD((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateSectionD = <K extends keyof LectureActivity>(
		id: string,
		key: K,
		value: LectureActivity[K]
	) =>
		setSectionD((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);

	// Section E CRUD operations
	const addSectionE = () =>
		setSectionE((list) => [
			...list,
			{
				id: crypto.randomUUID(),
				points: 0,
				detailsOfActivities: "",
			},
		]);
	const removeSectionE = (id: string) =>
		setSectionE((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateSectionE = <K extends keyof ArticleActivity>(
		id: string,
		key: K,
		value: ArticleActivity[K]
	) =>
		setSectionE((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);

	const sectionPayload: StudentActivitiesSection = useMemo(
		() => ({
			A: sectionA,
			B: sectionB,
			C: sectionC,
			D: sectionD,
			E: sectionE,
			apiScore: null,
		}),
		[sectionA, sectionB, sectionC, sectionD, sectionE]
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

	return (
		<AppraisalLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						7. Student Activities (Item 13)
					</CardTitle>
					<CardDescription>
						Contribution/Participation in Students Extra & Co-Curricular
						activities. Total API score for this item will be clipped at 60.
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
						{/* Tab Navigation */}
						<div className="flex gap-2 border-b overflow-x-auto">
							<button
								type="button"
								onClick={() => setActiveTab("A")}
								className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
									activeTab === "A"
										? "border-b-2 border-primary text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Societies/Hubs
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("B")}
								className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
									activeTab === "B"
										? "border-b-2 border-primary text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Departmental
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("C")}
								className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
									activeTab === "C"
										? "border-b-2 border-primary text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Institute
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("D")}
								className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
									activeTab === "D"
										? "border-b-2 border-primary text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Lectures
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("E")}
								className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
									activeTab === "E"
										? "border-b-2 border-primary text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Articles
							</button>
						</div>

						{/* Section A: Societies/Hubs */}
						{activeTab === "A" && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold">
											A. Societies/Hubs (Event Details)
										</h3>
										<p className="text-sm text-muted-foreground">
											5 points per activity, 10 if lead role (max 20 points)
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addSectionA}
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Entry
									</Button>
								</div>

								<div className="rounded-lg border overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-muted/50 text-muted-foreground">
											<tr>
												<th className="px-4 py-3 text-left w-[25%]">
													Name of Club
												</th>
												<th className="px-4 py-3 text-left w-[15%]">
													Played Lead Role
												</th>
												<th className="px-4 py-3 text-left w-[50%]">
													Details of Activities
												</th>
												<th className="px-4 py-3 w-[10%]"></th>
											</tr>
										</thead>
										<tbody>
											{sectionA.map((e) => (
												<tr key={e.id} className="border-t align-top">
													<td className="p-3">
														<Input
															value={e.nameOfClub}
															onChange={(ev) =>
																updateSectionA(
																	e.id,
																	"nameOfClub",
																	ev.target.value
																)
															}
															placeholder="e.g., Google Developer Group"
														/>
													</td>
													<td className="p-3">
														<Select
															value={e.playedLeadRole ? "true" : "false"}
															onValueChange={(value) =>
																updateSectionA(
																	e.id,
																	"playedLeadRole",
																	value === "true"
																)
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="true">Yes</SelectItem>
																<SelectItem value="false">No</SelectItem>
															</SelectContent>
														</Select>
													</td>
													<td className="p-3">
														<Textarea
															value={e.detailsOfActivities}
															onChange={(ev) =>
																updateSectionA(
																	e.id,
																	"detailsOfActivities",
																	ev.target.value
																)
															}
															placeholder="Describe activities, responsibilities, achievements..."
															rows={2}
														/>
													</td>
													<td className="p-3 text-right">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeSectionA(e.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Section B: Departmental Activities */}
						{activeTab === "B" && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold">
											B. Departmental Activities & Development
										</h3>
										<p className="text-sm text-muted-foreground">
											5 points for Incharge/Chairman, 3 for member (max 20
											points)
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addSectionB}
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Entry
									</Button>
								</div>

								<div className="rounded-lg border overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-muted/50 text-muted-foreground">
											<tr>
												<th className="px-4 py-3 text-left w-[30%]">Role</th>
												<th className="px-4 py-3 text-left w-[60%]">
													Details of Activities
												</th>
												<th className="px-4 py-3 w-[10%]"></th>
											</tr>
										</thead>
										<tbody>
											{sectionB.map((e) => (
												<tr key={e.id} className="border-t align-top">
													<td className="p-3">
														<Select
															value={e.role}
															onValueChange={(value) =>
																updateSectionB(e.id, "role", value)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select role" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="Incharge">
																	Incharge
																</SelectItem>
																<SelectItem value="Chairman">
																	Chairman
																</SelectItem>
																<SelectItem value="Member">Member</SelectItem>
															</SelectContent>
														</Select>
													</td>
													<td className="p-3">
														<Textarea
															value={e.detailsOfActivities}
															onChange={(ev) =>
																updateSectionB(
																	e.id,
																	"detailsOfActivities",
																	ev.target.value
																)
															}
															placeholder="Describe departmental activities and contributions..."
															rows={2}
														/>
													</td>
													<td className="p-3 text-right">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeSectionB(e.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Section C: Institute Activities */}
						{activeTab === "C" && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold">
											C. Institute Activities & Development
										</h3>
										<p className="text-sm text-muted-foreground">
											10 points for Director/Dean/HOD positions, 5 for
											committees (max 20 points)
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addSectionC}
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Entry
									</Button>
								</div>

								<div className="rounded-lg border overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-muted/50 text-muted-foreground">
											<tr>
												<th className="px-4 py-3 text-left w-[30%]">
													Position Type
												</th>
												<th className="px-4 py-3 text-left w-[60%]">
													Details of Activities
												</th>
												<th className="px-4 py-3 w-[10%]"></th>
											</tr>
										</thead>
										<tbody>
											{sectionC.map((e) => (
												<tr key={e.id} className="border-t align-top">
													<td className="p-3">
														<Select
															value={e.positionType}
															onValueChange={(value) =>
																updateSectionC(e.id, "positionType", value)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select position" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="Director">
																	Director
																</SelectItem>
																<SelectItem value="Dean">Dean</SelectItem>
																<SelectItem value="HOD">HOD</SelectItem>
																<SelectItem value="Time Table Incharge">
																	Time Table Incharge
																</SelectItem>
																<SelectItem value="Training & Placement Incharge">
																	Training & Placement Incharge
																</SelectItem>
																<SelectItem value="Chairman - Institution Committee">
																	Chairman - Institution Committee
																</SelectItem>
																<SelectItem value="Member - Institution Committee">
																	Member - Institution Committee
																</SelectItem>
																<SelectItem value="Individual Responsibility">
																	Individual Responsibility
																</SelectItem>
															</SelectContent>
														</Select>
													</td>
													<td className="p-3">
														<Textarea
															value={e.detailsOfActivities}
															onChange={(ev) =>
																updateSectionC(
																	e.id,
																	"detailsOfActivities",
																	ev.target.value
																)
															}
															placeholder="Describe institute-level activities and responsibilities..."
															rows={2}
														/>
													</td>
													<td className="p-3 text-right">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeSectionC(e.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Section D: Lectures Delivered */}
						{activeTab === "D" && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold">
											D. Special/Extension/Expert/Invited Lectures Delivered
										</h3>
										<p className="text-sm text-muted-foreground">
											10 points for outside institute, 5 for within (max 20
											points)
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addSectionD}
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Entry
									</Button>
								</div>

								<div className="rounded-lg border overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-muted/50 text-muted-foreground">
											<tr>
												<th className="px-4 py-3 text-left w-[30%]">Nature</th>
												<th className="px-4 py-3 text-left w-[60%]">
													Details of Activities
												</th>
												<th className="px-4 py-3 w-[10%]"></th>
											</tr>
										</thead>
										<tbody>
											{sectionD.map((e) => (
												<tr key={e.id} className="border-t align-top">
													<td className="p-3">
														<Select
															value={e.nature}
															onValueChange={(value) =>
																updateSectionD(e.id, "nature", value)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select nature" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="Outside Institute">
																	Outside Institute
																</SelectItem>
																<SelectItem value="Within Institute">
																	Within Institute
																</SelectItem>
															</SelectContent>
														</Select>
													</td>
													<td className="p-3">
														<Textarea
															value={e.detailsOfActivities}
															onChange={(ev) =>
																updateSectionD(
																	e.id,
																	"detailsOfActivities",
																	ev.target.value
																)
															}
															placeholder="Describe lecture topic, venue, audience, date..."
															rows={2}
														/>
													</td>
													<td className="p-3 text-right">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeSectionD(e.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Section E: Articles/Reports */}
						{activeTab === "E" && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold">
											E. Articles, Monographs, Technical Reports, Reviews
											Written
										</h3>
										<p className="text-sm text-muted-foreground">
											1/2/3 points each based on level, quality, effort (max 10
											points)
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addSectionE}
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Entry
									</Button>
								</div>

								<div className="rounded-lg border overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-muted/50 text-muted-foreground">
											<tr>
												<th className="px-4 py-3 text-left w-[15%]">Points</th>
												<th className="px-4 py-3 text-left w-[75%]">
													Details of Activities
												</th>
												<th className="px-4 py-3 w-[10%]"></th>
											</tr>
										</thead>
										<tbody>
											{sectionE.map((e) => (
												<tr key={e.id} className="border-t align-top">
													<td className="p-3">
														<Select
															value={e.points.toString()}
															onValueChange={(value) =>
																updateSectionE(e.id, "points", Number(value))
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Points" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="1">1</SelectItem>
																<SelectItem value="2">2</SelectItem>
																<SelectItem value="3">3</SelectItem>
															</SelectContent>
														</Select>
													</td>
													<td className="p-3">
														<Textarea
															value={e.detailsOfActivities}
															onChange={(ev) =>
																updateSectionE(
																	e.id,
																	"detailsOfActivities",
																	ev.target.value
																)
															}
															placeholder="Describe article/monograph/report title, publication, impact..."
															rows={2}
														/>
													</td>
													<td className="p-3 text-right">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeSectionE(e.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
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
