/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { type } from "os";
import UttView from "./UttView";
import { api } from "~/utils/api";
import Image from "next/image";
import { useState } from "react";

export default function ConvList(props: {
  props: string;
  handleDaUpdate(): unknown;
  // handleDaUpdate: any;
}) {
  const utterances = api.conversations.getUtteranceList.useQuery({
    convNumber: props.props,
  });

  const conv = api.conversations.getConversationInfo.useQuery({
    convNumber: props.props,
  });

  const [derail, setDerail] = useState(conv.data ? conv.data.derailPoint : "");

  function handleDerail(id: string) {
    setDerail(id);
    props.handleDaUpdate();
  }

  // const speakerData = api.conversations.getSpeakerData.useQuery();

  return (
    <div className="overflow-none no-scrollbar flex h-screen justify-center">
      <div className="flex h-full w-full flex-col   md:max-w-5xl">
        <div className="no-scrollbar justify-center">
          {utterances.data ? (
            utterances.data.info ? (
              utterances.data.info.map((utt) => (
                <UttView
                  speaker={utt.speaker}
                  text={utt.text}
                  time={utt.timestamp}
                  score={utt.meta.pred_score}
                  posReactions={utt.meta.posReactions}
                  negReactions={utt.meta.negReactions}
                  convNumber={utt.conversation_id}
                  id={utt.id}
                  // url={
                  //   JSON.parse(speakerData.data.speakerData)[utt.speaker][
                  //     "meta"
                  //   ]["avatar"]
                  // }
                  // role={
                  //   JSON.parse(speakerData.data.speakerData)[utt.speaker][
                  //     "meta"
                  //   ]["role"]
                  // }
                  willDerail={utt.meta.prediction == "1" ? true : false}
                  derail={derail}
                  default={conv.data.derailPoint}
                  handleState={() => {
                    handleDerail(utt.id);
                    props.handleDaUpdate();
                  }}
                ></UttView>
              ))
            ) : (
              <div className="flex justify-center self-center  align-middle">
                <Image
                  src={"/loading.svg"}
                  width={450}
                  height={100}
                  alt={"Loading Bar"}
                ></Image>
              </div>
            )
          ) : (
            <div className="flex justify-center self-center  align-middle">
              <Image
                src={"/loading.svg"}
                width={450}
                height={100}
                alt={"Loading Bar"}
              ></Image>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
