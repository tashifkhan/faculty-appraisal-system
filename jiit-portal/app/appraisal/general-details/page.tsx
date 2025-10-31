"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { GeneralDetailsForm, GeneralDetailsSection } from "@/lib/types";
import { getSectionData, updateSectionData } from "@/lib/localStorage";
import { simulateApiCall } from "@/lib/mockApi";
import { APPRAISAL_SECTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, CalendarIcon } from "lucide-react";
import AppraisalLayout from "@/components/AppraisalLayout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function GeneralDetails() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiScore, setApiScore] = useState<number | null>(null);
	const [joiningDate, setJoiningDate] = useState<Date | undefined>();

	const currentIndex = APPRAISAL_SECTIONS.findIndex(
		(s) => s.id === "general-details"
	);
	const nextSection = APPRAISAL_SECTIONS[currentIndex + 1];

	const { register, handleSubmit, reset, setValue } =
		useForm<GeneralDetailsForm>({
			defaultValues: {
				name: "Dr. Shikha K Mehta",
				presentDesignation: "",
				qualifications: "",
				department: "Computer Science & Engineering",
				instituteJoiningDate: "",
				firstDesignation: "",
				presentPayScaleAndPay: 0,
				areasOfInterest: "",
				additionalQualification: "",
				pursuingHigherStudies: "",
			},
		});

	useEffect(() => {
		const existingData = getSectionData("generalDetails");
		if (existingData) {
			const { ...formData } = existingData as GeneralDetailsSection;
			reset(formData);
			setApiScore(existingData.apiScore ?? null);
			if (formData.instituteJoiningDate) {
				setJoiningDate(new Date(formData.instituteJoiningDate));
			}
		}
	}, [reset]);

	const onSubmit = async (data: GeneralDetailsForm) => {
		setIsSubmitting(true);
		try {
			const result = await simulateApiCall("general-details", data);
			const section: GeneralDetailsSection = { ...data, apiScore: null };
			updateSectionData("generalDetails", section, result.score);
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
					<CardTitle className="text-2xl">1. General Details</CardTitle>
					<CardDescription>
						Provide your basic information and qualifications
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

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									{...register("name")}
									disabled
									className="bg-muted"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="presentDesignation">Present Designation</Label>
								<Input
									id="presentDesignation"
									{...register("presentDesignation")}
									placeholder="e.g., Assistant Professor"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="qualifications">Qualifications</Label>
								<Input
									id="qualifications"
									{...register("qualifications")}
									placeholder="e.g., Ph.D., M.Tech"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="department">Department</Label>
								<Input
									id="department"
									{...register("department")}
									disabled
									className="bg-muted"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="instituteJoiningDate">
									Institute Joining Date
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!joiningDate && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{joiningDate ? (
												format(joiningDate, "PPP")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={joiningDate}
											onSelect={(date) => {
												setJoiningDate(date);
												if (date) {
													setValue(
														"instituteJoiningDate",
														format(date, "yyyy-MM-dd")
													);
												}
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>{" "}
							<div className="space-y-2">
								<Label htmlFor="firstDesignation">First Designation</Label>
								<Input
									id="firstDesignation"
									{...register("firstDesignation")}
									placeholder="e.g., Lecturer"
								/>
							</div>
							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="presentPayScaleAndPay">
									Present Pay Scale & Pay
								</Label>
								<Input
									type="number"
									id="presentPayScaleAndPay"
									{...register("presentPayScaleAndPay", {
										valueAsNumber: true,
									})}
									placeholder="Enter amount"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="areasOfInterest">
								Areas of Specialization and Current Interest
							</Label>
							<Textarea
								id="areasOfInterest"
								{...register("areasOfInterest")}
								placeholder="Describe your areas of expertise and research interests..."
								rows={4}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="additionalQualification">
								Additional Qualification Acquired
							</Label>
							<Textarea
								id="additionalQualification"
								{...register("additionalQualification")}
								placeholder="List any additional qualifications or certifications..."
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="pursuingHigherStudies">
								Pursuing Higher Studies
							</Label>
							<Textarea
								id="pursuingHigherStudies"
								{...register("pursuingHigherStudies")}
								placeholder="Mention if you are currently pursuing any higher education..."
								rows={3}
							/>
						</div>

						<div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
							<Button type="button" variant="outline" disabled>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Previous
							</Button>

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
