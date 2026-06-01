import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Page } from '@/models';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const page = await Page.findById(id);
        if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
        return NextResponse.json(page, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch page" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        
        const page = await Page.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
        
        return NextResponse.json(page, { status: 200 });
    } catch (error: any) {
        if (error.code === 11000) return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
        return NextResponse.json({ message: error.message || "Failed to update page" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const page = await Page.findByIdAndDelete(id);
        
        if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
        
        return NextResponse.json({ message: "Page deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to delete page" }, { status: 500 });
    }
}
