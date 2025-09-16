import {
  Account,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Permission,
  Role,
} from "react-native-appwrite";
import { CreateUserParams, SignInParams } from "@/type";
import type { MenuItem, Category, Address, CreateAddressParams } from "@/type";

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
  addressesTableId: "addresses",
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
  const base = appwriteConfig.endpoint.replace(/\/+$/, "");
  const n = encodeURIComponent(name || "U");
  const project = encodeURIComponent(appwriteConfig.projectId);

  return `${base}/avatars/initials?name=${n}&project=${project}`;
};
export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Account create failed");

    await signIn({ email, password });

    const avatarUrl = buildAvatarUrl(name);
    const payload: Record<string, any> = {
      email,
      name,
      accountId: newAccount.$id,
    };
    if (isValidUrl(avatarUrl) && avatarUrl.length <= 2000) {
      payload.avatar = avatarUrl;
    }

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
    const current = await account.get().catch(() => null);

    if (current) {
      if (
        typeof current.email === "string" &&
        current.email.toLowerCase() === email.toLowerCase()
      ) {
        return;
      }

      await account.deleteSession("current");
    }

    await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    const msg = String(e?.message ?? e);

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
  return res.documents;
};

async function getAccountId(): Promise<string> {
  const acc = await account.get();
  return acc.$id;
}

export async function createAddress(
  data: CreateAddressParams
): Promise<Address> {
  const accountId = await getAccountId();

  const payload = {
    userId: accountId,
    label: data.label,
    fullName: data.fullName,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2 ?? "",
    city: data.city,
    state: data.state ?? "",
    postalCode: data.postalCode ?? "",
    country: data.country ?? "Türkiye",
    isDefault: Boolean(data.isDefault),
    // createdAt/updatedAt GÖNDERME!
  };

  const permissions = [
    Permission.read(Role.user(accountId)),
    Permission.update(Role.user(accountId)),
    Permission.delete(Role.user(accountId)),
  ];

  const doc = await databases.createDocument<Address>(
    appwriteConfig.databaseId,
    appwriteConfig.addressesTableId,
    ID.unique(),
    payload,
    permissions
  );

  return doc;
}

// Kullanıcının adreslerini listele (en yeniler üstte)
export async function listMyAddresses(): Promise<Address[]> {
  const accountId = await getAccountId();
  const res = await databases.listDocuments<Address>(
    appwriteConfig.databaseId,
    appwriteConfig.addressesTableId,
    [
      Query.equal("userId", accountId),
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ]
  );
  return res.documents;
}

// ----- ADDRESS HELPERS -----

export type UpdateAddressParams = Partial<Omit<CreateAddressParams, "label">>;

export async function updateAddress(
  id: string,
  data: UpdateAddressParams
): Promise<Address> {
  const payload: Record<string, any> = {
    ...(data.fullName !== undefined && { fullName: data.fullName }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.line1 !== undefined && { line1: data.line1 }),
    ...(data.line2 !== undefined && { line2: data.line2 ?? "" }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.state !== undefined && { state: data.state ?? "" }),
    ...(data.postalCode !== undefined && { postalCode: data.postalCode ?? "" }),
    ...(data.country !== undefined && { country: data.country ?? "Türkiye" }),
    // updatedAt GÖNDERME!
  };

  return databases.updateDocument<Address>(
    appwriteConfig.databaseId,
    appwriteConfig.addressesTableId,
    id,
    payload
  );
}
export async function deleteAddress(addressId: string): Promise<void> {
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.addressesTableId,
    addressId
  );
}

/**
 * Seçilen adresi varsayılan yapar.
 * 1) Kullanıcının mevcut default adresini (varsa) isDefault=false yap
 * 2) Hedef adresi isDefault=true yap
 */

export async function setDefaultAddress(addressId: string): Promise<void> {
  const accountId = await getAccountId();

  // mevcut default'ları kapat
  const current = await databases.listDocuments<Address>(
    appwriteConfig.databaseId,
    appwriteConfig.addressesTableId,
    [
      Query.equal("userId", accountId),
      Query.equal("isDefault", true),
      Query.limit(50),
    ]
  );

  await Promise.all(
    current.documents
      .filter((d) => d.$id !== addressId)
      .map((d) =>
        databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.addressesTableId,
          d.$id,
          { isDefault: false } // updatedAt GÖNDERME!
        )
      )
  );

  // hedefi default yap
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.addressesTableId,
    addressId,
    { isDefault: true } // updatedAt GÖNDERME!
  );
}
/** En son seçilen default adresi getir (yoksa null) */
export async function getMyDefaultAddress(): Promise<Address | null> {
  const accountId = await getAccountId();
  const res = await databases.listDocuments<Address>(
    appwriteConfig.databaseId,
    appwriteConfig.addressesTableId,
    [
      Query.equal("userId", accountId),
      Query.equal("isDefault", true),
      Query.limit(1),
    ]
  );
  return res.documents[0] ?? null;
}
