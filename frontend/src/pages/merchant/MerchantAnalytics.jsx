import { useState, useMemo } from "react";
import { getSalesAnalytics, getDatasetMeta } from "../../services/salesAnalyticsService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import "./MerchantAnalytics.css";

const datasetMeta = getDatasetMeta();

function formatCurrency(val) {
  const num = Number(val || 0);
  return `£${num.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(val) {
  return Number(val || 0).toLocaleString();
}

function MerchantAnalytics() {
  const [startDate, setStartDate] = useState(datasetMeta.minDate);
  const [endDate, setEndDate] = useState(datasetMeta.maxDate);
  const [country, setCountry] = useState("All countries");
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState(10);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Compute filtered analytics data
  const data = useMemo(() => {
    return getSalesAnalytics({
      startDate,
      endDate,
      country,
      query,
      topN,
    });
  }, [startDate, endDate, country, query, topN]);

  const { metrics, topProducts, tableProducts, monthlyTrends, countryBreakdown, countries } = data;

  const handleResetFilters = () => {
    setStartDate(datasetMeta.minDate);
    setEndDate(datasetMeta.maxDate);
    setCountry("All countries");
    setQuery("");
    setTopN(10);
  };

  // Max calculations for proportional bars
  const maxProductUnits = useMemo(() => {
    if (!topProducts || topProducts.length === 0) return 1;
    return Math.max(...topProducts.map((p) => p.units), 1);
  }, [topProducts]);

  const maxCountryRevenue = useMemo(() => {
    if (!countryBreakdown || countryBreakdown.length === 0) return 1;
    return Math.max(...countryBreakdown.map((c) => c.revenue), 1);
  }, [countryBreakdown]);

  // SVG Trend Line Chart Geometry
  const svgGeometry = useMemo(() => {
    if (!monthlyTrends || monthlyTrends.length === 0) return null;
    const width = 600;
    const height = 220;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };

    const maxRev = Math.max(...monthlyTrends.map((m) => m.revenue), 1000);
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const points = monthlyTrends.map((m, i) => {
      const x = padding.left + (i / Math.max(monthlyTrends.length - 1, 1)) * plotWidth;
      const y = padding.top + plotHeight - (m.revenue / maxRev) * plotHeight;
      return { x, y, month: m.month, revenue: m.revenue, units: m.units };
    });

    const pathD = points.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ""
    );

    const areaD =
      points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${
            padding.top + plotHeight
          } Z`
        : "";

    // Y-axis ticks (4 ticks)
    const yTicks = [0, maxRev * 0.33, maxRev * 0.66, maxRev].map((val) => ({
      val,
      y: padding.top + plotHeight - (val / maxRev) * plotHeight,
      label: `£${(val / 1000).toFixed(0)}k`,
    }));

    return { width, height, padding, points, pathD, areaD, yTicks };
  }, [monthlyTrends]);

  return (
    <div className="merchant-analytics">
      {/* Page Header */}
      <div className="analytics-header">
        <div>
          <h1>Sales Analytics</h1>
          <p>
            Explore product sales trends, units, and country revenue using retail transaction history.
          </p>
        </div>

        <div className="analytics-header-actions">
          <Button variant="secondary" size="small" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="analytics-filters-card">
        <div className="analytics-filters-header">
          <span className="analytics-filters-title">
            <span>⚙️</span> Interactive Filters
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Dataset range: {datasetMeta.minDate} to {datasetMeta.maxDate}
          </span>
        </div>

        <div className="analytics-filters-grid">
          {/* Start Date */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="startDate">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="filter-input"
              value={startDate}
              min={datasetMeta.minDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="endDate">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className="filter-input"
              value={endDate}
              min={startDate}
              max={datasetMeta.maxDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Country Selector */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="countrySelect">
              Country
            </label>
            <select
              id="countrySelect"
              className="filter-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Product Search */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="productQuery">
              Find a product
            </label>
            <input
              id="productQuery"
              type="text"
              className="filter-input"
              placeholder="Product name or code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Top Products Slider */}
          <div className="slider-container">
            <div className="slider-header">
              <span>Products to show</span>
              <span className="slider-value-pill">{topN} products</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={topN}
              className="filter-range"
              onChange={(e) => setTopN(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="analytics-metrics-grid">
        <Card padding="small">
          <div className="metric-card">
            <span className="metric-label">Units Sold</span>
            <strong className="metric-value">{formatNumber(metrics.units)}</strong>
            <span className="metric-sub">Total items sold in period</span>
          </div>
        </Card>

        <Card padding="small">
          <div className="metric-card">
            <span className="metric-label">Sales Revenue</span>
            <strong className="metric-value">{formatCurrency(metrics.revenue)}</strong>
            <span className="metric-sub">Gross revenue generated</span>
          </div>
        </Card>

        <Card padding="small">
          <div className="metric-card">
            <span className="metric-label">Orders</span>
            <strong className="metric-value">{formatNumber(metrics.orders)}</strong>
            <span className="metric-sub">Completed transactions</span>
          </div>
        </Card>

        <Card padding="small">
          <div className="metric-card">
            <span className="metric-label">Top Product</span>
            <strong className="metric-value" style={{ fontSize: "17px" }} title={metrics.bestProduct}>
              {metrics.bestProduct.length > 25
                ? `${metrics.bestProduct.substring(0, 25)}...`
                : metrics.bestProduct}
            </strong>
            <span className="metric-sub">Highest volume item</span>
          </div>
        </Card>

        <Card padding="small">
          <div className="metric-card">
            <span className="metric-label">Returned Units</span>
            <strong className="metric-value" style={{ color: "var(--danger)" }}>
              {formatNumber(metrics.returnUnits)}
            </strong>
            <span className="metric-sub">Cancellations / returns</span>
          </div>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Chart 1: Units Sold by Product */}
        <Card
          title={`Top ${topProducts.length} Products by Units Sold`}
          subtitle="Highest volume items in the selected date range & filters"
        >
          {topProducts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "16px 0" }}>
              No products match current filters.
            </p>
          ) : (
            <div className="bar-chart-list">
              {topProducts.map((p, idx) => {
                const percent = Math.min(100, Math.round((p.units / maxProductUnits) * 100));
                return (
                  <div className="bar-chart-row" key={`${p.StockCode}-${idx}`}>
                    <div className="bar-chart-info">
                      <span className="bar-chart-title" title={p.Description}>
                        <span className="bar-chart-rank">{idx + 1}</span>
                        {p.Description}
                      </span>
                      <span className="bar-chart-value">{formatNumber(p.units)} units</span>
                    </div>
                    <div className="bar-chart-track">
                      <div
                        className="bar-chart-fill-product"
                        style={{ width: `${Math.max(percent, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Chart 2: Monthly Sales Trend */}
        <Card
          title="Monthly Sales Trend"
          subtitle="Revenue performance trend over time"
        >
          {svgGeometry ? (
            <div className="trend-chart-container">
              {hoveredPoint && (
                <div className="chart-tooltip">
                  <strong>{hoveredPoint.month}</strong>: {formatCurrency(hoveredPoint.revenue)} ({formatNumber(hoveredPoint.units)} units)
                </div>
              )}

              <svg
                viewBox={`0 0 ${svgGeometry.width} ${svgGeometry.height}`}
                className="trend-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#25a579" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#25a579" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-axis Grid Lines */}
                {svgGeometry.yTicks.map((tick, i) => (
                  <g key={i}>
                    <line
                      x1={svgGeometry.padding.left}
                      y1={tick.y}
                      x2={svgGeometry.width - svgGeometry.padding.right}
                      y2={tick.y}
                      className="trend-grid-line"
                    />
                    <text
                      x={svgGeometry.padding.left - 8}
                      y={tick.y + 4}
                      textAnchor="end"
                      className="trend-axis-label"
                    >
                      {tick.label}
                    </text>
                  </g>
                ))}

                {/* Area under curve */}
                {svgGeometry.areaD && (
                  <path d={svgGeometry.areaD} fill="url(#trendGradient)" />
                )}

                {/* Trend line */}
                {svgGeometry.pathD && (
                  <path d={svgGeometry.pathD} className="trend-line" />
                )}

                {/* Interactive Points */}
                {svgGeometry.points.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      className="trend-dot"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* X-axis Month Label */}
                    <text
                      x={pt.x}
                      y={svgGeometry.height - 12}
                      textAnchor="middle"
                      className="trend-axis-label"
                      transform={`rotate(35, ${pt.x}, ${svgGeometry.height - 12})`}
                    >
                      {pt.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "16px 0" }}>
              No trend data available for current selection.
            </p>
          )}
        </Card>

        {/* Chart 3: Revenue by Country */}
        <Card
          title="Revenue by Country"
          subtitle="Top 10 international markets by sales revenue"
        >
          {countryBreakdown.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "16px 0" }}>
              No country data matching selection.
            </p>
          ) : (
            <div className="bar-chart-list">
              {countryBreakdown.map((c, idx) => {
                const percent = Math.min(100, Math.round((c.revenue / maxCountryRevenue) * 100));
                return (
                  <div className="bar-chart-row" key={`${c.country}-${idx}`}>
                    <div className="bar-chart-info">
                      <span className="bar-chart-title">
                        <span className="bar-chart-rank">{idx + 1}</span>
                        {c.country}
                      </span>
                      <span className="bar-chart-value">{formatCurrency(c.revenue)}</span>
                    </div>
                    <div className="bar-chart-track">
                      <div
                        className="bar-chart-fill-country"
                        style={{ width: `${Math.max(percent, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Chart 4: Product Quantity Table */}
        <Card
          title="Product Sales Table"
          subtitle="Top product performers and sales figures"
        >
          <div className="analytics-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Units</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {tableProducts.map((p, idx) => (
                  <tr key={`${p.StockCode}-${idx}`}>
                    <td>
                      <strong>#{idx + 1}</strong>
                    </td>
                    <td title={p.Description} style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.Description}
                    </td>
                    <td>
                      <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {p.StockCode}
                      </span>
                    </td>
                    <td>
                      <strong>{formatNumber(p.units)}</strong>
                    </td>
                    <td>{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Dataset Information Notice */}
      <div className="dataset-note-card">
        <strong>About this dataset & sales analytics:</strong>
        <p style={{ margin: "4px 0 0" }}>
          This analytics module processes over 530,000 retail transactions from the UCI Online Retail dataset.
          It provides merchants with historical demand patterns, volume distributions, and country sales benchmarks
          to inform group procurement planning and inventory replenishment decisions within Nexora.
        </p>
      </div>
    </div>
  );
}

export default MerchantAnalytics;
