import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, LineElement, PointElement } from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns"; // Required for time scale handling
import axios from "axios";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  PointElement
);

const StockChart = () => {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceVelocity, setPriceVelocity] = useState(null);
  const [marketCap, setMarketCap] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
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

    const realTimeInterval = setInterval(fetchRealTimeData, 1000); // 1 second

    return () => clearInterval(realTimeInterval);
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
    labels: priceHistory.map((point) => point.time),
    datasets: [
      {
        label: "Stock Price",
        data: priceHistory.map((point) => point.value),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  const lineChartOptions = {
    animation: false, // Disable animation
    scales: {
      x: { type: "time", time: { unit: "second" } },
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

      <div style={{ marginTop: "20px" }}>
        <h3>Price History</h3>
        <Chart type="line" data={lineChartData} options={lineChartOptions} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>
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
    </div>
  );
};

export default StockChart;
