## pubsub-example-worker

An example [Cloudflare Worker](https://developers.cloudflare.com/workers/) that acts as an on-publish hook for [Pub/Sub](https://developers.cloudflare.com/pub-sub/).

To deploy this to your own account:

- Update `account_id` in `wrangler.toml` to use your own account ID
- Update the `BROKER_PUBLIC_KEYS` environmental variable with the public key set from your own Broker — the `.../pubsub/namespaces/{namespace}/brokers/{broker}/publickeys` endpoint in the API will return your broker-specific keys ([docs](https://developers.cloudflare.com/pub-sub/learning/integrate-workers/#connect-a-worker-to-a-broker))
- Publish it with `wrangler publish`

With the Worker deployed, you can then update your Broker configuration to use the Worker as an on-publish hook by setting the `on_publish.url` field to the URL of your Worker ([see the docs](https://developers.cloudflare.com/pub-sub/learning/integrate-workers/#connect-a-worker-to-a-broker)).

## License

BSD-3-Clause licensed. Copyright Cloudflare, Inc, 2022.
