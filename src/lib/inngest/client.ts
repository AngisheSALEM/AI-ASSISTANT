import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "opere-app",
  eventKey: process.env.INNGEST_EVENT_KEY || process.env.INGEST_EVENT_KEY
});
