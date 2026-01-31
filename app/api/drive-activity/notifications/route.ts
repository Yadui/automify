import { postContentToWebHook } from "@/app/(main)/connections/_actions/discord-connections";
import { onCreateNewPageInDatabase } from "@/app/(main)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/connections/_actions/slack-connection";
import db from "@/lib/db";
import axios from "axios";
import { headers } from "next/headers";

export async function POST() {
  console.log("🔴 Changed");
  const headersList = await headers();
  let channelResourceId;
  headersList.forEach((value, key) => {
    if (key === "x-goog-resource-id") {
      channelResourceId = value;
    }
  });

  if (channelResourceId) {
    const user = await db.user.findFirst({
      where: {
        googleResourceId: channelResourceId,
      },
      select: { id: true, credits: true, tier: true },
    });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const credits = user.tier === "Unlimited" ? Infinity : user.credits || 0;

    if (credits > 0) {
      const workflows = await db.workflow.findMany({
        where: {
          userId: user.id,
          publish: true,
        },
      });

      if (workflows && workflows.length > 0) {
        for (const flow of workflows) {
          if (!flow.flowPath) continue;

          let flowPath;
          try {
            flowPath = JSON.parse(flow.flowPath);
          } catch (e) {
            console.error("Invalid flowPath JSON", e);
            continue;
          }

          let current = 0;
          while (current < flowPath.length) {
            const nodeType = flowPath[current];

            if (nodeType === "Discord") {
              const discordConnection = await db.connection.findFirst({
                where: {
                  userId: user.id,
                  provider: "discord",
                },
              });
              if (discordConnection) {
                await postContentToWebHook(
                  flow.discordTemplate || "",
                  discordConnection.accessToken, // Webhook URL
                );
                flowPath.splice(current, 1);
                current--; // Adjust index due to splice
              }
            } else if (nodeType === "Slack") {
              const slackConnection = await db.connection.findFirst({
                where: {
                  userId: user.id,
                  provider: "slack",
                },
              });
              if (slackConnection) {
                const channels = flow.slackChannels.map((channel) => ({
                  label: "",
                  value: channel,
                }));
                await postMessageToSlack(
                  slackConnection.accessToken,
                  channels,
                  flow.slackTemplate || "",
                );
                flowPath.splice(current, 1);
                current--;
              }
            } else if (nodeType === "Notion") {
              const notionConnection = await db.connection.findFirst({
                where: {
                  userId: user.id,
                  provider: "notion",
                },
              });
              if (notionConnection) {
                await onCreateNewPageInDatabase(
                  flow.notionDbId!,
                  notionConnection.accessToken,
                  JSON.parse(flow.notionTemplate || "{}"),
                );
                flowPath.splice(current, 1);
                current--;
              }
            } else if (nodeType === "Wait") {
              const res = await axios.put(
                "https://api.cron-job.org/jobs",
                {
                  job: {
                    url: `${process.env.NGROK_URI}?flow_id=${flow.id}`,
                    enabled: "true",
                    schedule: {
                      timezone: "Europe/Istanbul",
                      expiresAt: 0,
                      hours: [-1],
                      mdays: [-1],
                      minutes: ["*****"],
                      months: [-1],
                      wdays: [-1],
                    },
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${process.env.CRON_JOB_KEY!}`,
                    "Content-Type": "application/json",
                  },
                },
              );
              if (res) {
                flowPath.splice(current, 1);
                await db.workflow.update({
                  where: {
                    id: flow.id,
                  },
                  data: {
                    cronPath: JSON.stringify(flowPath),
                  },
                });
                break; // Stop processing this flow for now
              }
              break;
            }
            current++;
          }

          // Deduct credits
          if (user.tier !== "Unlimited") {
            await db.user.update({
              where: { id: user.id },
              data: {
                credits: {
                  decrement: 1,
                },
              },
            });
          }
        }

        return Response.json({ message: "flows processed" }, { status: 200 });
      }
    }
  }

  return Response.json({ message: "success" }, { status: 200 });
}
