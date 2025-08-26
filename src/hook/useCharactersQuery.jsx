import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

const useCharactersQuery = ({ groupId }) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["learning", "groups", "characters", groupId],
    queryFn: async () => {
      const result = await get(`characters`, { groupId });
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        return {
          characters: response.data.items || [],
          total: response.data.total || 0,
        };
      }
      return { characters: [], total: 0 };
    },
    enabled: !!groupId,
    refetchOnMount: true, // 컴포넌트가 마운트될 때마다 refetch
    staleTime: 0, // 데이터를 항상 stale로 간주하여 refetch 허용
  });
  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

export default useCharactersQuery;
