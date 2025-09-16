import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppwrite from "@/lib/useAppwrite";
import { getCategories, getMenu } from "@/lib/appwrite";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import CartButton from "@/components/CartButton";
import cn from "clsx";
import MenuCard from "@/components/MenuCard";
import { MenuItem } from "@/type";
import Filter from "@/components/Filter";
import SearchBar from "@/components/SearchBar";
import MenuDetailModal from "@/components/MenuDetailModal";

export default function Search() {
  const { category, query } = useLocalSearchParams<{
    query?: string;
    category?: string;
  }>();

  // NOT: useAppwrite dönen tip OBJE olmak zorunda (data, refetch, loading)
  const {
    data = [],
    refetch,
    loading = false,
  } = useAppwrite<MenuItem[], any>({
    fn: getMenu,
    params: { category: category ?? "", query: query ?? "", limit: 6 },
  }) || ({} as any);

  const { data: categories = [] } =
    useAppwrite<{ $id: string; name: string }[], any>({
      fn: getCategories,
    }) || ({} as any);

  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [open, setOpen] = useState(false);

  // refetch güvenli çağrı
  useEffect(() => {
    if (typeof refetch === "function") {
      refetch({ category: category ?? "", query: query ?? "", limit: 6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query]);

  const listData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const openDetail = (item: MenuItem) => {
    setSelected(item);
    setOpen(true);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={listData}
        renderItem={({ item, index }) => {
          const isRightCol = index % 2 === 1;
          return (
            <View className={cn("flex-1 max-w-[48%]", isRightCol && "mt-10")}>
              <MenuCard item={item} onPress={() => openDetail(item)} />
            </View>
          );
        }}
        keyExtractor={(item, idx) =>
          item?.$id ? String(item.$id) : String(idx)
        }
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">
                  Search
                </Text>
                <View className="flex-start flex-row gap-x-1 mt-0.5">
                  <Text className="paragraph-semibold text-dark-100">
                    Find your favorite food
                  </Text>
                </View>
              </View>
              <CartButton />
            </View>
            <SearchBar />
            <Filter categories={categories} />
          </View>
        )}
        ListEmptyComponent={() =>
          !loading ? <Text className="px-5">No results</Text> : null
        }
      />

      <MenuDetailModal
        visible={open}
        item={selected}
        onClose={() => setOpen(false)}
      />
    </SafeAreaView>
  );
}
