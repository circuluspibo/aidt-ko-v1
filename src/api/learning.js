import { API_URL, VAPI_URL } from ".";

export const fetchLearningDataByTarget = async (type) => {
  try {
    const response = await fetch(`${API_URL()}/content?type=${type}`);

    if (!response.ok) {
      throw new Error("학습 데이터를 불러오는 데 실패했습니다.");
    }
    const res = await response.json();
    if (res?.result) {
      return res.data;
    }
    throw Error("학습 데이터를 불러오는 데 실패했습니다.");
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const fetchWriteOCR = async (isWord, body) => {
  const resp = await fetch(VAPI_URL(isWord), {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body,
  });
  const res = await resp.json();
  // 실패를 null/undefined로 삼키면 호출부가 성공으로 오인한다. 항상 throw.
  if (!res?.result || !res?.data?.[0]?.text) {
    throw new Error("채점 결과를 받지 못했습니다.");
  }
  return res.data[0];
};
