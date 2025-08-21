import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

const useGroupsQuery = ({ page: p, q, teacherId }) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["learning", "groups", p, q],
    queryFn: async () => {
      const page = p || 1;
      const result = await get("groups", { teacherId, page, q });
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        const list = response.data.items.map(({ status, ...rest }) => ({
          ...rest,
          status: status ? "활성" : "비활성",
        }));
        return { groups: list, total: response.data.total };
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

export default useGroupsQuery;
