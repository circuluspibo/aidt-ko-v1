export const fetchLearningDataByTarget = async (type) => {
  try {
    const response = await fetch(
      `http://localhost:59421/v1/content?type=${type}`
    );

    if (!response.ok) {
      throw new Error("학습 데이터를 불러오는 데 실패했습니다.");
    }
    const res = await response.json();
    console.log(res);
    if (res?.result) {
      return res.data;
    }
    throw Error("학습 데이터를 불러오는 데 실패했습니다.");
  } catch (error) {
    console.log(error);
    return error;
  }
};
