/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import fs from "fs/promises";
import fsSync from "fs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import JSONL from "jsonl-parse-stringify";
import archiver from "archiver";
// import { resolve } from "path";

export const convRouter = createTRPCRouter({
  getConversationInfo: publicProcedure
    .input(z.object({ convNumber: z.string() }))
    .query(async ({ input }) => {
      let output = "";
      let heated = null;
      let predHeated = null;
      let repository = "";
      let derailPoint = "";
      let commBefore = "";
      await fs
        .readFile(`~/../public/Corpus/conversations.json`, "utf8")
        .then((data) => {
          let conversations = JSON.parse(data);
          conversations = conversations["ROOT" + input.convNumber];
          heated = conversations.meta["heated"];
          predHeated = conversations.meta["predicted_heated"];
          repository = conversations.meta["repository"];
          derailPoint = conversations.meta["derailPoint"];
          commBefore = conversations["commentsBeforeDerailment"];
          const ret = JSON.stringify(conversations);
          output = ret; // Return the conversation data here
          // console.log(output);
        });
      // console.log(output);

      // if (output == undefined) {
      //   output = "No conversation found";
      // }

      return {
        info: output,
        convNum: input.convNumber,
        heated: heated,
        predHeated: predHeated,
        repository: repository,
        derailPoint: derailPoint,
        commBefore: commBefore,
      };
    }),
  getSpeakerData: publicProcedure
    .input(z.object({ speaker: z.string() }))
    .query(async ({ input }) => {
      let output = "";
      let image = "";
      let role = "";
      await fs
        .readFile(`~/../public/Corpus/speakers.json`, "utf8")
        .then((data) => {
          const conversations = JSON.parse(data)[input.speaker];
          image = conversations.meta.avatar;
          role = conversations.meta.role;
          const ret = JSON.stringify(conversations);

          output = ret; // Return the conversation data here
          // console.log(output);
        });
      return { speakerData: output, avatar: image, role: role };
    }),

  getUtteranceList: publicProcedure
    .input(z.object({ convNumber: z.string() }))
    .query(async ({ input }) => {
      let output;
      await fs
        .readFile(`~/../public/Corpus/utterances.jsonl`, "utf8")
        .then((data) => {
          const parsed = JSONL.parse<any>(data);
          // const stringified = JSONL.stringify(parsed);

          const utterances = [];
          for (let i = 0; i < parsed.length; i++) {
            if (parsed[i].conversation_id === "ROOT" + input.convNumber) {
              utterances.push(parsed[i]);
            }
            output = utterances;
          }
        });

      return { info: output, convNum: input.convNumber };
    }),

  setComment: publicProcedure
    .input(z.object({ convNumber: z.string(), comment: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const data = await fs.readFile(
          "~/../public/Corpus/conversations.json",
          "utf8"
        );
        const json = JSON.parse(data);

        if (json[input.convNumber]) {
          json[input.convNumber]["comment"] =
            (json[input.convNumber]["comment"] + input.comment).replace(
              "undefined",
              ""
            ) + " ";

          await fs.writeFile(
            "~/../public/Corpus/conversations.json",
            JSON.stringify(json, null, 2),
            "utf8"
          );

          console.log("File updated successfully!");
        } else {
          console.log(`Object ROOT${input.convNumber} does not exist.`);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }),

  setDerailPoint: publicProcedure
    .input(z.object({ convNumber: z.string(), derailPoint: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const data = await fs.readFile(
          "~/../public/Corpus/conversations.json",
          "utf8"
        );
        const json = JSON.parse(data);

        // console.log(input.convNumber);

        let derailNum = "";
        if (input.derailPoint.includes("ROOT")) {
          derailNum = "0";
        } else {
          derailNum = (
            parseInt(
              input.derailPoint
                .replace("ROOT", "")
                .replace("COM" + input.convNumber.replace("ROOT", "") + "_", "")
            ) + 1
          ).toString();
        }

        let firstPrediction = "";
        if (
          json[input.convNumber]["meta"]["firstPrediction"].includes("ROOT") ||
          json[input.convNumber]["meta"]["firstPrediction"] == undefined
        ) {
          firstPrediction = "0";
        } else {
          firstPrediction = (
            parseInt(
              json[input.convNumber]["meta"]["firstPrediction"]
                .replace("ROOT", "")
                .replace("COM" + input.convNumber.replace("ROOT", "") + "_", "")
            ) + 1
          ).toString();
        }

        console.log("Derail" + derailNum + " First" + firstPrediction);

        if (json[input.convNumber]) {
          json[input.convNumber]["derailPoint"] = input.derailPoint;
          json[input.convNumber]["commentsBeforeDerailment"] =
            parseInt(derailNum) - parseInt(firstPrediction);
          console.log(parseInt(derailNum) - parseInt(firstPrediction));

          await fs.writeFile(
            "~/../public/Corpus/conversations.json",
            JSON.stringify(json, null, 2),
            "utf8"
          );

          console.log("File updated successfully!");
        } else {
          console.log(`Object ROOT${input.convNumber} does not exist.`);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }),

  makeZip: publicProcedure.mutation(async () => {
    console.log("Making zip");
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = fsSync.createWriteStream("~/../public/download.zip");

    return await new Promise<void>((resolve, reject) => {
      archive
        .directory("~/../public/Corpus", false)
        .on("error", (err) => reject(err))
        .pipe(stream);
      stream.on("close", () => {
        resolve();
        console.log("DONE");
      });
      archive.finalize;
    });
  }),

  getCorpusData: publicProcedure.query(async () => {
    let utterances = "";
    let converations = "";
    let correctPredictions = "";
    let correctPredictionsHeated = "";
    let correctPredictionsCivil = "";
    let totalPredictedHeated = "";
    let totalPredictedCivil = "";
    let totalReallyCivil = "";
    let totalReallyHeated = "";

    await fs.readFile("~/../public/Corpus/corpus.json", "utf8").then((data) => {
      const conversations = JSON.parse(data);
      utterances = conversations.utterances;
      converations = conversations.conversations;
      correctPredictions = conversations.correctPredictions;
      correctPredictionsHeated = conversations["CorectPredctions-Heated"];
      correctPredictionsCivil = conversations["CorrectPrediction-Civil"];
      totalPredictedHeated = conversations.totalPredictedHeated;
      totalPredictedCivil = conversations.totalPredictedCivil;
      totalReallyCivil = conversations.totalReallyCivil;
      totalReallyHeated = conversations.totalReallyHeated;

      // console.log(output);
    });

    return {
      utterances: utterances,
      conversations: converations,
      correctPredictions: correctPredictions,
      correctPredictionsHeated: correctPredictionsHeated,
      correctPredictionsCivil: correctPredictionsCivil,
      totalPredictedHeated: totalPredictedHeated,
      totalPredictedCivil: totalPredictedCivil,
      totalReallyCivil: totalReallyCivil,
      totalReallyHeated: totalReallyHeated,
    };
  }),
});
