import WebSocket from "ws"
import { RedisManager } from "@repo/event-queue"
import { emitIndexPrice } from "./marketDataBus.js"

const STREAM = "btcusdt@markPrice"

export function startOracle() {
  const ws = new WebSocket(`wss://fstream.binance.com/ws/${STREAM}`)

  ws.on("open", () => console.log("Binance WS connected"))

  ws.on("message", raw => {
    const message = JSON.parse(raw.toString())
    const markPrice   = parseFloat(message.p)
    const indexPrice  = parseFloat(message.i)
    const fundingRate = parseFloat(message.r)
    const nextFunding = message.T

    const payload = JSON.stringify({s: "btcusdt", m: markPrice, i: indexPrice, r: fundingRate, T: nextFunding})
    RedisManager.getInstance().publishToChannel("prices:update", payload)
    emitIndexPrice(indexPrice)
  })

  ws.on("error", (error) => console.error("WS Error: ", error))

}