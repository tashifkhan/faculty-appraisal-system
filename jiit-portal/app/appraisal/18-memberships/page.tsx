"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { MembershipEntry, MembershipsSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function MembershipsPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [entries, setEntries] = useState<MembershipEntry[]>([
		{ id: crypto.randomUUID(), positionType: "", membershipDetails: "" },
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "18-memberships"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("memberships") as
			| MembershipsSection
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

	const addEntry = () =>
		setEntries((list) => [
			...list,
			{ id: crypto.randomUUID(), positionType: "", membershipDetails: "" },
		]);
	const removeEntry = (id: string) =>
		setEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateEntry = <K extends keyof MembershipEntry>(
		id: string,
		key: K,
		value: MembershipEntry[K]
	) =>
		setEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, [key]: value } : e))
		);

	const payload: MembershipsSection = useMemo(
		() => ({ entries, apiScore: null }),
		[entries]
	);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall("memberships", payload);
			updateSectionData("memberships", payload, result.score);
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
						12. Membership of Professional Bodies
					</CardTitle>
					<CardDescription>
						List professional memberships and associations.
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
										<th className="px-4 py-3 text-left w-[30%]">
											Position Type
										</th>
										<th className="px-4 py-3 text-left w-[60%]">
											Membership Details
										</th>
										<th className="px-4 py-3 w-[10%]"></th>
									</tr>
								</thead>
								<tbody>
									{entries.map((e) => (
										<tr key={e.id} className="border-t align-top">
											<td className="p-3">
												<Select
													value={e.positionType}
													onValueChange={(value) =>
														updateEntry(e.id, "positionType", value)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Member">Member</SelectItem>
														<SelectItem value="Senior Member">
															Senior Member
														</SelectItem>
														<SelectItem value="Fellow">Fellow</SelectItem>
														<SelectItem value="Life Member">
															Life Member
														</SelectItem>
														<SelectItem value="Associate Member">
															Associate Member
														</SelectItem>
														<SelectItem value="Honorary Member">
															Honorary Member
														</SelectItem>
													</SelectContent>
												</Select>
											</td>
											<td className="p-3">
												<Input
													value={e.membershipDetails}
													onChange={(ev) =>
														updateEntry(
															e.id,
															"membershipDetails",
															ev.target.value
														)
													}
													placeholder="e.g., IEEE - Institute of Electrical and Electronics Engineers"
												/>
											</td>
											<td className="p-3 text-right">
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
