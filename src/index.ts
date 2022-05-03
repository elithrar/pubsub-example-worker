// An example that shows how to consume and transform Pub/Sub messages from a Cloudflare Worker.

/// <reference types="@cloudflare/workers-types" />

import { isValidBrokerRequest, PubSubMessage } from "pubsub-utils"

async function pubsub(
  messages: Array<PubSubMessage>,
  env: any,
  ctx: ExecutionContext
): Promise<Array<PubSubMessage>> {
  // Messages may be batched at higher throughputs, so we should loop over
  // the incoming messages and process them as needed.

  // Messages we want to keep and forward to subscribers
  let outgoingMessages: Array<PubSubMessage>
  for (let msg of messages) {
    console.log(msg);
    // Replace the message contents in our topic - named "test/topic"
    // as a simple example
    if (msg.topic.startsWith("test/topic")) {
      msg.payload = `replaced text payload at ${Date.now()}`;
      // Ensure we push this to our outgoing messages array.
      outgoingMessages.push(msg) 
    }

    // Drop messages on any topic starting with debug/*
    if (msg.topic.startsWith("debug/")) {
      // Don't add this to our outgoing messages array
      console.log(`dropping mid ${msg.mid}`)
    }
  }

  return outgoingMessages;
}

const worker = {
  async fetch(req: Request, env: any, ctx: ExecutionContext) {
    // Each Broker has a unique key to distinguish between your Broker vs. others
    // These keys are available at /pubsub/namespaces/{namespace}/brokers/{broker}/publickeys
    //
    // We store these keys in environmental variables (https://developers.cloudflare.com/workers/platform/environment-variables/)
    // to avoid needing to fetch them on every request.
    let publicKeys = env.BROKER_PUBLIC_KEYS;

    // Critical: you must validate the incoming request is from your Broker.
    //
    // In the future, Workers will be able to do this on your behalf for Workers
    // in the same account as your Pub/Sub Broker.
    if (await isValidBrokerRequest(req, publicKeys)) {
      // Parse the PubSub message
      let incomingMessages: Array<PubSubMessage> = await req.json();

      // Pass the messages to our pubsub handler, and capture the returned
      // message.
      let outgoingMessages = await pubsub(incomingMessages, env, ctx);

      // Re-serialize the messages and return a HTTP 200.
      // The Content-Type is optional, but must either by
      // "application/octet-stream" or left empty.
      return new Response(JSON.stringify(outgoingMessages), { status: 200 });
    }

    return new Response("not a valid Broker request", { status: 403 });
  },
};

export default worker;
