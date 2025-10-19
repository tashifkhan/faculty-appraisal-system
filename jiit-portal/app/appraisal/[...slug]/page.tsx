"use client";

import AppraisalLayout from "@/components/AppraisalLayout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Construction } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PlaceholderSection() {
	const params = useParams<{ slug: string[] }>();
	const router = useRouter();
	const path = "/appraisal/" + (params.slug?.join("/") || "");

	const currentSection = APPRAISAL_SECTIONS.find((s) => s.route === path);
	const currentIndex = APPRAISAL_SECTIONS.findIndex((s) => s.route === path);
	const prevSection = APPRAISAL_SECTIONS[currentIndex - 1];
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	return (
		<AppraisalLayout>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl flex items-center gap-2">
						<Construction className="h-6 w-6 text-warning" />
						{currentSection?.title || "Section"}
					</CardTitle>
					<CardDescription>This section is under construction</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="py-12 text-center">
						<div className="mx-auto w-24 h-24 rounded-full bg-accent/50 flex items-center justify-center mb-4">
							<Construction className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
						<p className="text-muted-foreground mb-8">
							This appraisal section will be available shortly.
						</p>

						<div className="flex flex-col sm:flex-row justify-center gap-3">
							{prevSection && (
								<Button
									variant="outline"
									onClick={() => router.push(prevSection.route)}
								>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Previous Section
								</Button>
							)}

							{nextSection && (
								<Button onClick={() => router.push(nextSection.route)}>
									Next Section
									<ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</AppraisalLayout>
	);
}
