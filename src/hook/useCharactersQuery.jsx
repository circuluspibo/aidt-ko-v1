import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { transformStudentList } from "@/utils/dataTransformers";

const useCharactersQuery = ({ groupId }) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["learning", "groups", "characters", groupId],
    queryFn: async () => {
      const params = { groupId };
      const result = await get("characters", params);
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        // API 응답의 캐릭터 데이터를 통합된 학생 구조로 변환
        const transformedCharacters = transformStudentList(
          response.data.items || [],
          "api"
        );
        return {
          characters: transformedCharacters,
          total: response.data.total || 0,
        };
      }
      return { characters: [], total: 0 };
    },
    enabled: !!groupId, // groupId가 null이어도 전체 캐릭터 조회 허용
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

export { useCharactersQuery };
export default useCharactersQuery;
