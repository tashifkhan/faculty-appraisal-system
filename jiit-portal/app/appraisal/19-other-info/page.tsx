"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { OtherInfoEntry, OtherInfoSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function OtherInfoPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [selfEntries, setSelfEntries] = useState<OtherInfoEntry[]>([
		{ id: crypto.randomUUID(), details: "", points: 0 },
	]);
	const [nationalEntries, setNationalEntries] = useState<
		Omit<OtherInfoEntry, "points">[]
	>([{ id: crypto.randomUUID(), details: "" }]);
	const [internationalEntries, setInternationalEntries] = useState<
		Omit<OtherInfoEntry, "points">[]
	>([{ id: crypto.randomUUID(), details: "" }]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "19-other-info"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("otherInfo") as
			| OtherInfoSection
			| undefined;
		if (existing) {
			setApiScore(existing.apiScore ?? null);
			if (existing.self?.length) {
				setSelfEntries(
					existing.self.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
			if (existing.national?.length) {
				setNationalEntries(
					existing.national.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
			if (existing.international?.length) {
				setInternationalEntries(
					existing.international.map((e) => ({
						...e,
						id: e.id || crypto.randomUUID(),
					}))
				);
			}
		}
	}, []);

	// Self entries functions
	const addSelfEntry = () =>
		setSelfEntries((list) => [
			...list,
			{ id: crypto.randomUUID(), details: "", points: 0 },
		]);
	const removeSelfEntry = (id: string) =>
		setSelfEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateSelfEntry = <K extends keyof OtherInfoEntry>(
		id: string,
		key: K,
		value: OtherInfoEntry[K]
	) =>
		setSelfEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);

	// National entries functions
	const addNationalEntry = () =>
		setNationalEntries((list) => [
			...list,
			{ id: crypto.randomUUID(), details: "" },
		]);
	const removeNationalEntry = (id: string) =>
		setNationalEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateNationalEntry = (id: string, value: string) =>
		setNationalEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, details: value } : e))
		);

	// International entries functions
	const addInternationalEntry = () =>
		setInternationalEntries((list) => [
			...list,
			{ id: crypto.randomUUID(), details: "" },
		]);
	const removeInternationalEntry = (id: string) =>
		setInternationalEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateInternationalEntry = (id: string, value: string) =>
		setInternationalEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, details: value } : e))
		);

	const payload: OtherInfoSection = useMemo(
		() => ({
			self: selfEntries,
			national: nationalEntries,
			international: internationalEntries,
			apiScore: null,
		}),
		[selfEntries, nationalEntries, internationalEntries]
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall("other-info", payload);
			updateSectionData("otherInfo", payload, result.score);
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
					<CardTitle className="text-2xl">13. Other Information</CardTitle>
					<CardDescription>
						Provide details of other relevant activities, achievements, patents,
						technology transfers, products, or processes at self-assessed,
						national, and international levels.
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

					<form onSubmit={onSubmit} className="space-y-8">
						{/* Self-Assessed Entries (with points) */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold">
										Self-Assessed Activities
									</h3>
									<p className="text-sm text-muted-foreground">
										List your activities, achievements, or contributions with
										points
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addSelfEntry}
								>
									<Plus className="h-4 w-4 mr-1" />
									Add Entry
								</Button>
							</div>

							<div className="rounded-lg border overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-muted/50 text-muted-foreground">
										<tr>
											<th className="px-4 py-3 text-left w-[70%]">Details</th>
											<th className="px-4 py-3 text-left w-[20%]">Points</th>
											<th className="px-4 py-3 w-[10%]"></th>
										</tr>
									</thead>
									<tbody>
										{selfEntries.map((e) => (
											<tr key={e.id} className="border-t align-top">
												<td className="p-3">
													<Textarea
														value={e.details}
														onChange={(ev) =>
															updateSelfEntry(e.id, "details", ev.target.value)
														}
														placeholder="Describe the activity, achievement, or contribution..."
														rows={2}
													/>
												</td>
												<td className="p-3">
													<Input
														type="number"
														value={Number(e.points)}
														onChange={(ev) =>
															updateSelfEntry(
																e.id,
																"points",
																Number(ev.target.value) || 0
															)
														}
														placeholder="0-30"
														min="0"
														max="30"
													/>
												</td>
												<td className="p-3 text-right">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => removeSelfEntry(e.id)}
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

						{/* National Level Outputs (30 API points each) */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold">
										National Level Outputs
									</h3>
									<p className="text-sm text-muted-foreground">
										Patents, technology transfers, products, or processes at
										national level
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addNationalEntry}
								>
									<Plus className="h-4 w-4 mr-1" />
									Add Entry
								</Button>
							</div>

							<div className="rounded-lg border overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-muted/50 text-muted-foreground">
										<tr>
											<th className="px-4 py-3 text-left w-[90%]">Details</th>
											<th className="px-4 py-3 w-[10%]"></th>
										</tr>
									</thead>
									<tbody>
										{nationalEntries.map((e) => (
											<tr key={e.id} className="border-t align-top">
												<td className="p-3">
													<Textarea
														value={e.details}
														onChange={(ev) =>
															updateNationalEntry(e.id, ev.target.value)
														}
														placeholder="e.g., National Patent: Device for..., Technology Transfer to..."
														rows={2}
													/>
												</td>
												<td className="p-3 text-right">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => removeNationalEntry(e.id)}
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

						{/* International Level Outputs (50 API points each) */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold">
										International Level Outputs
									</h3>
									<p className="text-sm text-muted-foreground">
										Patents, technology transfers, products, or processes at
										international level
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addInternationalEntry}
								>
									<Plus className="h-4 w-4 mr-1" />
									Add Entry
								</Button>
							</div>

							<div className="rounded-lg border overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-muted/50 text-muted-foreground">
										<tr>
											<th className="px-4 py-3 text-left w-[90%]">Details</th>
											<th className="px-4 py-3 w-[10%]"></th>
										</tr>
									</thead>
									<tbody>
										{internationalEntries.map((e) => (
											<tr key={e.id} className="border-t align-top">
												<td className="p-3">
													<Textarea
														value={e.details}
														onChange={(ev) =>
															updateInternationalEntry(e.id, ev.target.value)
														}
														placeholder="e.g., International Patent (USPTO): System for..., Global Technology Transfer..."
														rows={2}
													/>
												</td>
												<td className="p-3 text-right">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => removeInternationalEntry(e.id)}
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
