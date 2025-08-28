export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT, 
    platform: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME,
    project: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    userTableId: 'user'

    };