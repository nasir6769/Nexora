import rawData from "../data/salesAnalyticsData.json";

/**
 * Service to query and filter sales analytics data based on date range,
 * country selection, product search query, and top-N slider.
 */
export const getSalesAnalytics = (filters = {}) => {
  const {
    startDate = rawData.minDate,
    endDate = rawData.maxDate,
    country = "All countries",
    query = "",
    topN = 10,
  } = filters;

  // Filter daily timeline
  const filteredDaily = rawData.daily.filter((row) => {
    const inDateRange = row.Date >= startDate && row.Date <= endDate;
    const matchCountry = country === "All countries" || row.Country === country;
    return inDateRange && matchCountry;
  });

  // Calculate totals from filtered timeline
  let units = 0;
  let revenue = 0;
  let orders = 0;
  let returnUnits = 0;

  const monthlyMap = {};
  const countryMap = {};

  filteredDaily.forEach((row) => {
    units += row.units || 0;
    revenue += row.revenue || 0;
    orders += row.orders || 0;
    returnUnits += row.returnUnits || 0;

    // Monthly aggregation
    const month = row.Date.substring(0, 7); // YYYY-MM
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, revenue: 0, units: 0 };
    }
    monthlyMap[month].revenue += row.revenue || 0;
    monthlyMap[month].units += row.units || 0;

    // Country aggregation
    const rowCountry = row.Country;
    if (rowCountry) {
      if (!countryMap[rowCountry]) {
        countryMap[rowCountry] = { country: rowCountry, revenue: 0, units: 0 };
      }
      countryMap[rowCountry].revenue += row.revenue || 0;
      countryMap[rowCountry].units += row.units || 0;
    }
  });

  // Sort monthly chronologically
  const monthlyTrends = Object.values(monthlyMap).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // Sort country by revenue descending (Top 10)
  const countryBreakdown = Object.values(countryMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Filter top products
  let filteredProducts = rawData.topProducts;
  if (query && query.trim() !== "") {
    const q = query.trim().toLowerCase();
    filteredProducts = filteredProducts.filter((p) => {
      const matchDesc = p.Description && p.Description.toLowerCase().includes(q);
      const matchCode = p.StockCode && String(p.StockCode).toLowerCase().includes(q);
      return matchDesc || matchCode;
    });
  }

  const bestProduct =
    filteredProducts.length > 0 ? filteredProducts[0].Description : "No matches";

  return {
    minDate: rawData.minDate,
    maxDate: rawData.maxDate,
    countries: rawData.countries,
    metrics: {
      units,
      revenue,
      orders,
      bestProduct,
      returnUnits,
    },
    topProducts: filteredProducts.slice(0, Math.min(topN, filteredProducts.length)),
    tableProducts: filteredProducts.slice(0, 15),
    monthlyTrends,
    countryBreakdown,
  };
};

export const getDatasetMeta = () => {
  return {
    minDate: rawData.minDate,
    maxDate: rawData.maxDate,
    countries: rawData.countries,
    totalSalesCount: rawData.totalSalesCount,
  };
};
