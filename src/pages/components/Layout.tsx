/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import ConvList from "./ConvList";
import { api } from "~/utils/api";
import archiver from "archiver";
import Image from "next/image";
import fs from "fs/promises";
import {
  type FormEvent,
  // useCallback,
  // useLayoutEffect,
  // useRef,
  useState,
  // useEffect,
} from "react";
import { waitForDebugger } from "inspector";
import useDownloader from "react-use-downloader";
import { threadId } from "worker_threads";
// import { set } from "zod";
// import useDownloader from "react-use-downloader";
// import { zip } from "zip-a-folder";

// import JSZip from "jszip";

export default function Layout() {
  const corp = api.conversations.getCorpusData.useQuery();

  const { size, elapsed, percentage, download, cancel, error, isInProgress } =
    useDownloader();

  const [inputValue, setInputValue] = useState("0");
  const [actualValue, setActualValue] = useState(inputValue);

  const conv = api.conversations.getConversationInfo.useQuery({
    convNumber: actualValue,
  });

  function handleChange(e: FormEvent) {
    // e.preventDefault();
    setInputValue(e.target.value);
  }

  function handleSubmit() {
    // e.preventDefault();
    // conv = api.conversations.getConversationInfo.useQuery({
    //   convNumber: inputValue,
    // });
    setActualValue(inputValue);
  }

  const [inputComment, setInputComment] = useState("");
  const [actualComment, setActualComment] = useState(inputComment);

  const addComment = api.conversations.setComment.useMutation();

  function handleCommentChange(e: FormEvent) {
    setInputComment(e.target.value);
    setActualComment(e.target.value);
  }

  function handleComment() {
    addComment.mutate({
      convNumber: "ROOT" + actualValue,
      comment: actualComment,
    });
  }

  const [updateNum, setUpdateNum] = useState(
    conv.data ? parseInt(conv.data.commBefore) : 0
  );

  function handleUpdate() {
    const val = conv.data ? parseInt(conv.data.commBefore) : 0;

    setUpdateNum(val);

    // console.log("Update");
  }

  const zipAPI = api.conversations.makeZip.useMutation();

  async function makeZip() {
    zipAPI.mutate();
    await new Promise((resolve) => setTimeout(resolve, 3000)).then(async () => {
      await download("/download.zip", "download.zip");
    });
  }

  return (
    <>
      <main className="no-scrollbar overflow-x-clip">
        <div className=" sticky  top-0 border-b-2 bg-gray-700">
          <div className=" flex w-screen content-center justify-center">
            <h1 className="bottom-20 mt-2 flex self-center pb-2 pt-5 align-middle font-sans text-5xl font-bold text-slate-200">
              CONV. {conv.data ? conv.data.convNum : "__"}
            </h1>
          </div>
          <div className="absolute right-16 top-8 flex w-max   justify-end">
            <div className="w relative flex pr-20">
              <textarea
                className="h-32 w-72 resize-none overflow-hidden rounded-sm border-4 border-slate-600 bg-transparent p-4 px-2 text-sm text-slate-100 placeholder-gray-200 outline-none"
                placeholder="Comment on the conversation..."
                onChange={(e) => handleCommentChange(e)}
              ></textarea>
              <button
                onClick={handleComment}
                className="absolute bottom-0 right-0 rounded-lg bg-slate-600 px-2 py-1 font-bold text-slate-100"
              >
                Submit
              </button>

              {/* <div
                className={`flex  items-center justify-center ${
                  conv.data
                    ? updateNum
                    : 0 > 3
                    ? "bg-green-300"
                    : conv.data
                    ? updateNum
                    : 0 > 0
                    ? "bg-yellow-300"
                    : "bg-red-300"
                } rounded-full border-4 border-black bg-green-200 px-3 py-1 text-2xl font-bold`}
              >
                {conv.data ? updateNum : 0}
                &#160;Comments Before Deraiment
              </div> */}
            </div>
          </div>

          <div className="absolute left-10 top-4">
            <div className="relative flex justify-center border-2 border-slate-100">
              {corp.data ? (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <ul className="flex flex-col items-center justify-center">
                    <li className="underline">
                      Total Utterances: {corp.data.utterances}
                    </li>
                    <li className=" ">
                      Total Conversations: {corp.data.conversations}
                      <li>
                        Heated: {corp.data.totalReallyHeated} | Predicted:{" "}
                        {corp.data.totalPredictedHeated} | Correct Predictions:{" "}
                        {corp.data.correctPredictionsHeated}
                      </li>
                      <li>
                        Civil: {corp.data.totalReallyCivil} | Predicted:{" "}
                        {corp.data.totalPredictedCivil} | Correct Predictions:{" "}
                        {corp.data.correctPredictionsCivil}
                      </li>
                    </li>
                    <li className="border-t-2 px-1 font-bold">
                      Total Correct Predictions: {corp.data.correctPredictions}|
                      Percentage:{" "}
                      {(
                        (parseInt(corp.data.correctPredictions) /
                          parseInt(corp.data.conversations)) *
                        100
                      ).toFixed(2)}
                      %
                    </li>
                  </ul>
                </div>
              ) : (
                <Image
                  src={"/loading.svg"}
                  width={450}
                  height={100}
                  alt={"Loading Bar"}
                ></Image>
              )}
            </div>
          </div>

          <div className=" order-last mr-12 flex w-screen content-center  justify-center pb-2 ">
            {/* <form action={void handleSubmit}> */}

            <button
              onClick={() => makeZip()}
              className=" rounded-lg border-2 border-blue-700 bg-blue-600 px-2 "
            >
              Download <span>| 3 sec</span>
            </button>
            <div className="px-3"></div>
            <input
              type="number"
              max={352}
              min={0}
              onChange={(e) => handleChange(e)}
              placeholder="Conv#"
              className="w-auto rounded-full border-2 border-slate-700 bg-stone-400 px-2 text-slate-100 placeholder-gray-200"
            ></input>
            <button
              onClick={handleSubmit}
              className="rounded-full border-2 border-slate-700 bg-stone-400 px-2 text-slate-100 placeholder-gray-200"
            >
              Go
            </button>
            {/* </form> */}
          </div>
          <div className="flex justify-center">
            <div className=" order-last mr-12 flex  w-screen content-center justify-center pb-4 ">
              <div
                className={` ${
                  conv.data
                    ? conv.data.heated
                      ? "bg-red-400"
                      : "bg-green-400"
                    : "bg-gray-400"
                }  rounded-full px-5 align-middle  text-xl font-semibold`}
              >
                {conv.data
                  ? conv.data.heated
                    ? "Heated"
                    : "Civil"
                  : "Loading..."}
              </div>
              <div className="mx-4 self-center rounded-lg bg-slate-400 px-4 align-middle font-bold text-slate-100">
                {conv.data ? conv.data.repository : "Loading..."}
              </div>
              <div
                className={`${
                  conv.data
                    ? conv.data.predHeated
                      ? "bg-red-400"
                      : "bg-green-400"
                    : "bg-gray-400"
                } rounded-full px-5 align-middle text-xl font-semibold`}
              >
                {conv.data
                  ? conv.data.predHeated
                    ? "Predicted Heated"
                    : "Predicted Civil"
                  : "Loading..."}
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <div className=""></div>
          <div className="no-scrollbar">
            <ConvList
              props={actualValue}
              handleDaUpdate={() => handleUpdate()}
            />
          </div>
        </div>
      </main>
    </>
  );
  // :
  // return (<div>Loading...</div>);
}
