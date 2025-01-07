import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, LineElement, PointElement } from "chart.js";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns"; // Required for time scale handling
import axios from "axios";

// Register necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    LineElement,
    PointElement,
    CandlestickController,
    CandlestickElement
);

const StockChart = () => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceVelocity, setPriceVelocity] = useState(null);
  const [marketCap, setMarketCap] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [candleData, setCandleData] = useState([]); // Store candlestick data
  const [timeWindow, setTimeWindow] = useState(5); // Default to 5 minutes
  const [priceChange, setPriceChange] = useState(null); // Gain/Loss meter
  const [percentageChange, setPercentageChange] = useState(null); // Percentage change

  useEffect(() => {
    // Fetch real-time price and related data every second
    const fetchRealTimeData = async () => {
      try {
        const priceRes = await axios.get("http://localhost:5000/current_price");
        setCurrentPrice(priceRes.data.current_price);

        const velocityRes = await axios.get("http://localhost:5000/velocity");
        setPriceVelocity(velocityRes.data.velocity);

        const marketCapRes = await axios.get("http://localhost:5000/market_cap");
        setMarketCap(marketCapRes.data.market_cap);

        // Update price history for line chart
        setPriceHistory((prev) => [
          ...prev,
          { time: new Date(), value: priceRes.data.current_price },
        ]);
      } catch (error) {
        console.error("Error fetching real-time data:", error);
      }
    };

    // Fetch candlestick data every minute
    const fetchCandlestickData = async () => {
      try {
        const candleRes = await axios.get("http://localhost:5000/candle");
        const candle = candleRes.data;
        if (!candle.error) {
          setCandleData((prev) => [
            ...prev,
            {
              x: new Date(), // Timestamp
              o: candle.open, // Open price
              h: candle.high, // High price
              l: candle.low,  // Low price
              c: candle.close, // Close price
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching candlestick data:", error);
      }
    };

    const realTimeInterval = setInterval(fetchRealTimeData, 1000); // 1 second
    const candlestickInterval = setInterval(fetchCandlestickData, 60000); // 1 minute

    return () => {
      clearInterval(realTimeInterval);
      clearInterval(candlestickInterval);
    };
  }, []);

  // Calculate price and percentage change for the selected time window
  useEffect(() => {
    if (priceHistory.length > 0) {
      const now = new Date();
      const windowStart = new Date(now - timeWindow * 60 * 1000);
      const filteredPrices = priceHistory.filter(
          (point) => new Date(point.time) >= windowStart
      );

      if (filteredPrices.length > 0) {
        const startPrice = filteredPrices[0].value;
        const endPrice = filteredPrices[filteredPrices.length - 1].value;
        const change = endPrice - startPrice;
        const percentChange = ((change / startPrice) * 100).toFixed(2);
        setPriceChange(change);
        setPercentageChange(percentChange);
      } else {
        setPriceChange(null); // No data for the selected time window
        setPercentageChange(null);
      }
    }
  }, [timeWindow, priceHistory]);

  // Filter price history based on the selected time window
  const filteredPriceHistory = priceHistory.filter(
      (point) => new Date() - new Date(point.time) <= timeWindow * 60 * 1000
  );

  // Format market cap
  const formatMarketCap = (cap) => {
    if (cap >= 1e9) {
      return `$${(cap / 1e9).toFixed(2)}B`;
    } else if (cap >= 1e6) {
      return `$${(cap / 1e6).toFixed(2)}M`;
    } else {
      return `$${cap.toLocaleString()}`;
    }
  };

  // Line chart for price history
  const lineChartData = {
    labels: filteredPriceHistory.map((point) => point.time),
    datasets: [
      {
        label: "Stock Price",
        data: filteredPriceHistory.map((point) => point.value),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  const lineChartOptions = {
    animation: false, // Disable animation
    scales: {
      x: { type: "time", time: { unit: "minute" } },
      y: { beginAtZero: false },
    },
  };

  return (
      <div style={{ width: "80%", margin: "auto" }}>
        <h1>Stock Price Simulator</h1>
        <h2>Current Price: {currentPrice ? `$${currentPrice.toFixed(2)}` : "Loading..."}</h2>
        <h3>Velocity: {priceVelocity !== null ? `${priceVelocity.toFixed(4)} units/sec` : "Loading..."}</h3>
        <h3>Market Cap: {marketCap !== null ? formatMarketCap(marketCap) : "Loading..."}</h3>

        <div style={{ marginTop: "20px" }}>
          <label htmlFor="timeWindow">Select Time Window: </label>
          <select
              id="timeWindow"
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
          >
            <option value={1}>1 Minute</option>
            <option value={5}>5 Minutes</option>
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={60}>1 Hour</option>
          </select>
        </div>

        <div style={{ marginTop: "10px" }}>
          <h3>
            Price Change:{" "}
            {priceChange !== null && percentageChange !== null ? (
                <span
                    style={{
                      color: priceChange > 0 ? "green" : "red",
                    }}
                >
              {priceChange > 0 ? "+" : ""}
                  {priceChange.toFixed(2)} ({priceChange > 0 ? "+" : ""}
                  {percentageChange}%)
            </span>
            ) : (
                "No data available for the selected time window"
            )}
          </h3>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Price History</h3>
          <Chart type="line" data={lineChartData} options={lineChartOptions} />
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Candlestick Data</h3>
          {candleData.length > 0 ? (
              <ul>
                {candleData.slice(-5).map((candle, index) => (
                    <li key={index}>
                      Time: {candle.x.toLocaleString()}, Open: {candle.o}, High: {candle.h}, Low:{" "}
                      {candle.l}, Close: {candle.c}
                    </li>
                ))}
              </ul>
          ) : (
              <p>No candlestick data available</p>
          )}
        </div>
      </div>
  );
};

export default StockChart;
