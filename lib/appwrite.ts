import {
  Account,
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

const isValidUrl = (u: string) => {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const buildAvatarUrl = (name: string) => {
  const base = appwriteConfig.endpoint.replace(/\/+$/, ""); // sondaki /'ları temizle
  const n = encodeURIComponent(name || "U");
  const project = encodeURIComponent(appwriteConfig.projectId);
  // Appwrite Avatars: /avatars/initials?name=...  (Cloud ve self-hosted aynı)
  // project parametresi Appwrite RN SDK çağrılarında genelde otomatik eklenir,
  // ama burada URL’i kendimiz kurduğumuz için explicit ekliyoruz.
  return `${base}/avatars/initials?name=${n}&project=${project}`;
};
export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    // 1) Hesabı oluştur
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Account create failed");

    // 2) Oturum aç (aynı kullanıcı zaten açıksa yeniden açmaya çalışmaz)
    await signIn({ email, password });

    // 3) Avatar URL (geçerliyse ekle)
    const avatarUrl = buildAvatarUrl(name);
    const payload: Record<string, any> = {
      email,
      name,
      accountId: newAccount.$id,
    };
    if (isValidUrl(avatarUrl) && avatarUrl.length <= 2000) {
      payload.avatar = avatarUrl;
    }

    // 4) Kullanıcı dökümanını oluştur
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userTableId,
      ID.unique(),
      payload
    );
  } catch (e: any) {
    throw new Error(e?.message ?? String(e));
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    // Aktif oturum var mı?
    const current = await account.get().catch(() => null);

    if (current) {
      // Aynı kullanıcı ise tekrar session oluşturma
      if (
        typeof current.email === "string" &&
        current.email.toLowerCase() === email.toLowerCase()
      ) {
        return;
      }
      // Farklı kullanıcı ise mevcut oturumu kapat
      await account.deleteSession("current");
    }

    // Yeni oturum
    await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    // Bazı ortamlarda "session is active" gelebilir; üstte zaten kapatma yaptığımız için
    // burada tekrar fırlatıyoruz ki UI hata göstersin.
    throw new Error(msg);
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
  return res.documents;
};

export const getCategories = async () => {
  const res = await databases.listDocuments<Category>(
    appwriteConfig.databaseId,
    appwriteConfig.categoryTableId,
    [Query.limit(100)]
  );
  return res.documents; // (Models.Document & Category)[]
};
