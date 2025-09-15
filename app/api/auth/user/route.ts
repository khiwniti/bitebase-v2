import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/server-utils/storage'
import { authenticateRequest } from '@/server-utils/nextAuth'

export async function GET(request: NextRequest) {
  try {
    // Get the auth status
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.claims.sub;
    const userData = await storage.getUser(userId);
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure all data is JSON serializable
    const serializedUserData = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      businessType: userData.businessType,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
    
    return NextResponse.json(serializedUserData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}