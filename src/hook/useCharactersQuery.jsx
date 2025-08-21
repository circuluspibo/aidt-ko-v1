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
        return { characters: response.data.items, total: response.data.total };
      }
    },
  });
  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

export default useCharactersQuery;
