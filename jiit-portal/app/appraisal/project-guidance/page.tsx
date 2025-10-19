"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppraisalLayout from "@/components/AppraisalLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { ProjectGuidanceSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProjectGuidancePage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [projectsGuided, setProjectsGuided] = useState<number>(0);
	const [studentsGuided, setStudentsGuided] = useState<number>(0);

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "project-guidance"
	);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	useEffect(() => {
		const existing = getSectionData("projectGuidance") as
			| ProjectGuidanceSection
			| undefined;
		if (existing) {
			setProjectsGuided(Number(existing.projectsGuided) || 0);
			setStudentsGuided(Number(existing.studentsGuided) || 0);
			setApiScore(existing.apiScore ?? null);
		}
	}, []);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const payload: ProjectGuidanceSection = {
				projectsGuided: Number.isFinite(projectsGuided) ? projectsGuided : 0,
				studentsGuided: Number.isFinite(studentsGuided) ? studentsGuided : 0,
				apiScore: null,
			};
			const result = await simulateApiCall("project-guidance", payload);
			updateSectionData("projectGuidance", payload, result.score);
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
						5. Project Guidance at UG level
					</CardTitle>
					<CardDescription>
						Enter details for total projects and students guided.
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

					<form onSubmit={onSubmit} className="space-y-6 max-w-xl">
						<div className="space-y-2">
							<Label htmlFor="projects-guided">Number of Projects Guided</Label>
							<Input
								id="projects-guided"
								type="number"
								placeholder="e.g., 5"
								value={Number.isFinite(projectsGuided) ? projectsGuided : 0}
								onChange={(e) => setProjectsGuided(Number(e.target.value) || 0)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="students-guided">Number of Students Guided</Label>
							<Input
								id="students-guided"
								type="number"
								placeholder="e.g., 15"
								value={Number.isFinite(studentsGuided) ? studentsGuided : 0}
								onChange={(e) => setStudentsGuided(Number(e.target.value) || 0)}
							/>
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
