import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, image, password } = body;

        // Validate input
        if (!email || !name || !password) {
            console.log("Missing fields in request body");
            return NextResponse.json(
                { error: "All fields are required: email, name, and password." },
                { status: 400 }
            );
        }
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log("User already exists:", existingUser);
            return NextResponse.json(
                { error: "User already exists with this email." },
                { status: 409 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the user in the database
        const user = await prisma.user.create({
            data: {
                email,
                name,
                image,
                hashedPassword
            }
        });

        console.log("User successfully registered:", user);

        // Return successful response
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An error occurred during registration. Please try again later." },
            { status: 500 }
        );
    }
}
