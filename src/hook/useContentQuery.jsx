import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

const useContentQuery = (characterId, chapterId, method) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["learning", "content", characterId, chapterId, method],
    queryFn: async () => {
      const result = await get(`content`, { characterId, chapterId });
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        // "index" : 0, "level" : 0, "repeat" : 3, "target" : "vowel", "difficulty" : "1", "contents"
        return response.data;
      } else {
        return [];
      }
    },
    enabled: !!(characterId && chapterId), // target이 있을 때만 쿼리를 실행합니다.
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 fresh 상태로 유지 (API 호출 최소화)
    // initialData: {
    //   target: "vowel",
    //   contents: [],
    // },
  });
  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

export default useContentQuery;
