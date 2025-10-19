"use client";

import { useState } from "react";
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
import { setAuth, setUser } from "@/lib/localStorage";
import { toast } from "sonner";

export default function Login() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Mock authentication
		setTimeout(() => {
			if (email && password) {
				setAuth(true);
				setUser({
					name: "Dr. Shikha K Mehta",
					email: email,
					department: "Computer Science & Engineering",
				});
				toast.success("Login successful!");
				router.push("/dashboard");
			} else {
				toast.error("Please enter email and password");
			}
			setIsLoading(false);
		}, 800);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
			<Card className="w-full max-w-md shadow-xl">
				<CardHeader className="space-y-3 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
						<span className="text-2xl font-bold">JI</span>
					</div>
					<CardTitle className="text-2xl">Faculty Appraisal Portal</CardTitle>
					<CardDescription>
						Sign in to submit your annual performance appraisal
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="faculty@jiit.ac.in"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</form>
					<div className="mt-6 text-center text-sm text-muted-foreground">
						<p>Demo credentials: Any email and password</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
