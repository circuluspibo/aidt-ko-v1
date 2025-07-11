import { useParams } from "react-router-dom";
import LearnByListen from "@/components/LearnByListen";
import LearnByRead from "@/components/LearnByRead";
import LearnBySpeak from "@/components/LearnBySpeak";
import LearnByWrite from "@/components/LearnByWrite";

const Learn = () => {
  const { character, target, method } = useParams();

  return (
    <>
      {method === "read" && (
        <LearnByRead character={character} target={target} />
      )}
      {method === "listen" && (
        <LearnByListen character={character} target={target} />
      )}
      {method === "speak" && (
        <LearnBySpeak character={character} target={target} />
      )}
      {method === "write" && (
        <LearnByWrite character={character} target={target} />
      )}
    </>
  );
};

export default Learn;
