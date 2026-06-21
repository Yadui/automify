import { postContentToWebHook } from "@/app/(main)/connections/_actions/discord-connections";
import { onCreateNewPageInDatabase } from "@/app/(main)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/connections/_actions/slack-connection";
import db from "@/lib/db";
import { headers } from "next/headers";

// This route receives Google Drive push-notification pings (x-goog-resource-id header).
// It must be exported as POST (App Router) — the old `export default handler` never ran.
export async function POST() {
  const headersList = await headers();
  const channelResourceId = headersList.get("x-goog-resource-id");

  if (!channelResourceId) {
    return Response.json({ message: "no resource id" }, { status: 200 });
  }

  const user = await db.user.findFirst({
    where: { googleResourceId: channelResourceId },
    select: { appId: true, credits: true },
  });

  if (!user) {
    return Response.json({ message: "user not found" }, { status: 404 });
  }

  if (parseInt(user.credits!) <= 0 && user.credits !== "Unlimited") {
    return Response.json({ message: "no credits" }, { status: 200 });
  }

  const workflows = await db.workflows.findMany({
    where: { userId: user.appId, publish: true },
  });

  for (const flow of workflows) {
    if (!flow.flowPath) continue;

    const flowPath: string[] = JSON.parse(flow.flowPath);
    // Iterate over a copy — remove executed items by index (not by value)
    let i = 0;
    while (i < flowPath.length) {
      const step = flowPath[i];

      if (step === "Discord") {
        const webhook = await db.discordWebhook.findFirst({
          where: { userId: flow.userId },
          select: { url: true },
        });
        if (webhook) {
          await postContentToWebHook(flow.discordTemplate || "", webhook.url);
        }
        flowPath.splice(i, 1); // remove by index
        continue; // don't increment — next item shifts into position i
      }

      if (step === "Slack") {
        const channels = flow.slackChannels.map((ch) => ({ label: "", value: ch }));
        await postMessageToSlack(
          flow.slackAccessToken || "",
          channels,
          flow.slackTemplate || "",
        );
        flowPath.splice(i, 1);
        continue;
      }

      if (step === "Notion") {
        await onCreateNewPageInDatabase(
          flow.notionDbId || "",
          flow.notionAccessToken || "",
          JSON.parse(flow.notionTemplate || "{}"),
        );
        flowPath.splice(i, 1);
        continue;
      }

      // Unknown step — skip
      i++;
    }

    // Deduct credit after executing the workflow
    if (user.credits !== "Unlimited") {
      await db.user.update({
        where: { appId: user.appId },
        data: { credits: `${parseInt(user.credits!) - 1}` },
      });
    }
  }

  return Response.json({ message: "flow completed" }, { status: 200 });
}
