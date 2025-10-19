"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
		{ id: crypto.randomUUID(), detail: "" },
	]);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "memberships"
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
		setEntries((list) => [...list, { id: crypto.randomUUID(), detail: "" }]);
	const removeEntry = (id: string) =>
		setEntries((list) =>
			list.length > 1 ? list.filter((e) => e.id !== id) : list
		);
	const updateEntry = (id: string, value: string) =>
		setEntries((list) =>
			list.map((e) => (e.id === id ? { ...e, detail: value } : e))
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
		} catch (err) {
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
						<div className="space-y-3">
							{entries.map((e) => (
								<div
									key={e.id}
									className="flex items-center gap-3 rounded-lg border p-3"
								>
									<div className="flex-1">
										<p className="text-xs text-muted-foreground mb-1">
											Membership Detail
										</p>
										<Input
											value={e.detail}
											onChange={(ev) => updateEntry(e.id, ev.target.value)}
											placeholder="e.g., IEEE (Sr. Member), MIR Labs"
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeEntry(e.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
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
