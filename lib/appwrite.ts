import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import { CreateUserParams, SignInParams } from "@/type";
import type { MenuItem, Category } from "@/type";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.food.ordering",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  bucketId: "68b08f690037b639e56a",
  userTableId: "user",
  categoryTableId: "categories",
  menuTableId: "menu",
  customizationsTableId: "customizations",
  menuCustomizationsTableId: "menu_customizations",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitials(name);

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userTableId,
      ID.unique(),
      { email, name, accountId: newAccount.$id, avatar: avatarUrl }
    );
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const session = await account.createEmailPasswordSession(email, password);
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userTableId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

export const getMenu = async ({
  category,
  query,
  limit = 6,
}: {
  category?: string;
  query?: string;
  limit?: number;
}) => {
  const queries: string[] = [Query.limit(limit)];
  if (category) queries.push(Query.equal("categories", category));
  if (query) queries.push(Query.search("name", query));

  const res = await databases.listDocuments<MenuItem>(
    appwriteConfig.databaseId,
    appwriteConfig.menuTableId,
    queries
  );
  return res.documents; // (Models.Document & MenuItem)[]
};

export const getCategories = async () => {
  const res = await databases.listDocuments<Category>(
    appwriteConfig.databaseId,
    appwriteConfig.categoryTableId,
    [Query.limit(100)]
  );
  return res.documents; // (Models.Document & Category)[]
};
