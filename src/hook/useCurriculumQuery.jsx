import { useQuery } from "@tanstack/react-query";
import { get } from "@/api";

const useCurriculumQuery = (characterId) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["character", "curriculum", characterId],
    queryFn: async () => {
      const result = await get(`character/${characterId}/curriculum`);
      return result;
    },
    select: (response) => {
      if (response && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !!characterId,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 fresh 상태로 유지
    gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지
  });

  return {
    curriculumData: data,
    isCurriculumLoading: isPending,
    isCurriculumError: error,
    refetchCurriculum: refetch,
  };
};

export default useCurriculumQuery;
