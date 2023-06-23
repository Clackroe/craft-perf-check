/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/utils/api";
import Image from "next/image";
// import render from "react-dom";
import { useState } from "react";
// import { render } from "react-dom";

export default function ConvList(props: {
  handleState(): unknown;
  speaker: string;
  text: string;
  time: string;
  score: string;
  derail: string;
  posReactions: string;
  negReactions: string;
  convNumber: string;
  id: string;
  default: string;
  // handleState: any;
  // url: string;
  // role: string;
  willDerail: boolean;
}) {
  const speaker = api.conversations.getSpeakerData.useQuery({
    speaker: props.speaker,
  });

  // const data = JSON.parse(speaker.data?.speakerData);

  const updateDerail = api.conversations.setDerailPoint.useMutation();
  const conv = api.conversations.getConversationInfo.useQuery({
    convNumber: props.convNumber.replace("ROOT", ""),
  });
  // const [derail, setDerail] = useState(props.derail);

  function handleDerail() {
    updateDerail.mutate({
      convNumber: props.convNumber,
      derailPoint: props.id,
    });
    // setDerail(props.id);
    props.handleState();
    // window.location.reload();
  }

  return (
    <div className="border-x-2 border-b-2 border-slate-400 border-x-slate-100 p-2 text-slate-100">
      <div className="flex justify-start border-b-2 border-slate-600">
        <div className="flex self-center">
          <div className=" mb-1 h-10 w-10 self-center overflow-hidden rounded-full pb-2 align-middle">
            <Image
              loading="lazy"
              className="pb-2"
              src={speaker.data ? speaker.data.avatar : "/loading.svg"}
              width={50}
              height={50}
              alt="Profile Pic"
            ></Image>
          </div>
          <div className="bold self-center pb-2 pl-2 align-middle text-lg font-bold">
            @{props.speaker}
          </div>
        </div>
        <div className=" flex grow self-center ">
          <div className="px-2 align-middle ">·</div>
          <div className="self-center pb-1.5 align-middle text-base text-slate-400">
            {speaker.data ? speaker.data.role : "Loading..."}
          </div>
          <div className="flex grow justify-center">
            <div className="text-slate-400">
              Prediction Score: {(parseFloat(props.score) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="self-center pb-2">
          {" "}
          <div
            className={` self-center rounded-full border-2  border-slate-600 ${
              props.willDerail ? "bg-red-400" : "bg-green-400"
            } px-5 text-xl font-semibold text-slate-900`}
          >
            {props.willDerail ? "Might Derail" : "Will Not Derail"}
          </div>
        </div>
      </div>
      <div className="text- bar no-scrollbar overflow-x-scroll whitespace-normal px-3 pb-2 pt-2">
        {props.text}
      </div>
      <div className=" flex justify-end border-t-2 border-slate-600 pt-1">
        <div className="flex grow justify-start">
          <button
            onClick={handleDerail}
            className={`rounded-full border-2 ${
              props.derail == props.id || props.default == props.id
                ? "bg-red-300"
                : "bg-gray-300"
            }  border-slate-900  px-5 text-xl font-semibold text-slate-900 hover:cursor-pointer hover:border-slate-300 hover:text-slate-300`}
          >
            {props.derail == props.id || props.default == props.id
              ? "Derail Point"
              : "Set Derail Point"}
          </button>
        </div>
        <div className="flex">
          <div className="rounded-full border-2 border-gray-600  bg-slate-500 px-1">
            &#128077;{props.posReactions}
          </div>
          <div className="px-1"></div>
          <div className="rounded-full border-2 border-gray-600  bg-slate-500 px-1">
            &#128078;{props.negReactions}
          </div>
        </div>
      </div>
    </div>
  );
}
