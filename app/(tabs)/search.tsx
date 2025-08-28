import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppwrite from "@/lib/useAppwrite";
import { getCategories, getMenu } from "@/lib/appwrite";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import CartButton from "@/components/CartButton";
import cn from "clsx";
import MenuCard from "@/components/MenuCard";
import { MenuItem } from "@/type";
import Filter from "@/components/Filter";
import SearchBar from "@/components/SearchBar";
import MenuDetailModal from "@/components/MenuDetailModal";

const Search = () => {
  const { category, query } = useLocalSearchParams<{
    query: string;
    category: string;
  }>();

  const { data, refetch, loading } = useAppwrite<MenuItem[], any>({
    fn: getMenu,
    params: { category, query, limit: 6 },
  });
  const { data: categories } = useAppwrite({ fn: getCategories });

  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    refetch({ category, query, limit: 6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query]);

  const openDetail = (item: MenuItem) => {
    setSelected(item);
    setOpen(true);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={data || []}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View
              className={cn(
                "flex-1 max-w-[48%]",
                !isFirstRightColItem ? "mt-10" : "mt-0"
              )}
            >
              <MenuCard
                item={item as MenuItem}
                onPress={() => openDetail(item as MenuItem)}
              />
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
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
            <Filter categories={categories || []} />
          </View>
        )}
        ListEmptyComponent={() => !loading && <Text>No results</Text>}
      />

      <MenuDetailModal
        visible={open}
        item={selected}
        onClose={() => setOpen(false)}
      />
    </SafeAreaView>
  );
};

export default Search;
