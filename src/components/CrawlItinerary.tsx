import {
  MapPin,
  Clock,
  DollarSign,
  Utensils,
  ArrowLeft,
  Download,
  Check,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ResultMap } from "./ResultMap";
import { loadGoogleMapsScript } from '../utils/googleMapsLoader'
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { Crawl, Stop } from "./types";
import {
  PRICE_TIER_RANGE_DISPLAY,
  getTotalRangeUpper,
} from "../utils/pricerangestuff";

interface Props {
  crawl: Crawl;
  onReset: () => void;
  /** Called when the map optimizes stop order for shortest walking path; parent can update crawl.stops. */
  onOrderOptimized?: (orderedStops: Stop[]) => void;
  /** Called when the user clicks Save Crawl */
  onSaveCrawl?: () => void;
  /** Whether the crawl is currently being saved */
  isSaving?: boolean;
  /** Whether the crawl was just saved (show checkmark) */
  justSaved?: boolean;
}

export function CrawlItinerary({ crawl, onReset, onOrderOptimized, onSaveCrawl, isSaving, justSaved }: Props) {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());

  const toggleExpanded = (stopId: string) => {
    setExpandedStops(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stopId)) {
        newSet.delete(stopId);
      } else {
        newSet.add(stopId);
      }
      return newSet;
    });
  };

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!key) {
    throw Error("Missing api key google")
  }

  useEffect(() => {
    loadGoogleMapsScript(key)
      .then(() => {
        setMapsLoaded(true);
        setMapError(null);
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        setMapError(err.message);
      });
  }, []);

  const handleDownload = () => {
    const restaurantCount = crawl.stops.filter((s) => s.type === "restaurant").length;
    const priceRangeText = crawl.budgetTier
      ? `Food Funds: ${restaurantCount === 0 ? "Free" : getTotalRangeUpper(crawl.budgetTier, restaurantCount)} | ${PRICE_TIER_RANGE_DISPLAY[crawl.budgetTier].label} per meal`
      : `$${crawl.totalCost}`;
    const content = `
MY FOOD CRAWL ITINERARY
=====================

Total Stops: ${crawl.stops.length}
Price Range: ${priceRangeText}
Total Time: ${Math.floor(crawl.totalTime / 60)}h ${crawl.totalTime % 60}m

STOPS:
${crawl.stops
  .map(
    (stop, index) => `
${index + 1}. ${stop.name} ${stop.type === "landmark" ? "📍" : "🍽️"}
   ${stop.description}
   Address: ${stop.address}
   Duration: ${stop.duration} minutes
   ${stop.type === "restaurant" ? `Price: ${stop.priceTier ?? '$' + stop.price}` : "Free Entry"}
   ${stop.cuisine ? `Cuisine: ${stop.cuisine}` : ""}
`,
  )
  .join("\n")}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "food-crawl-itinerary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-0">
      {/* Header */}
      <div
        className="bg-white rounded-2xl p-6 mb-6 border border-gray-100"
        style={{
          boxShadow: "0 10px 30px rgba(245, 159, 0, 0.15)",
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 transition-colors"
            style={{ color: "#242116", opacity: 0.6 }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = "1")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = "0.6")
            }
          >
            <ArrowLeft className="w-5 h-5" />
            New Search
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            style={{ backgroundColor: "#f3f4f6" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#f3f4f6")
            }
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        <div className="text-center mb-6">
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: "#242116" }}
          >
            Your Curated Food Crawl
          </h2>
          <p style={{ color: "#242116", opacity: 0.6 }}>
            {crawl.stops.length} amazing stops await you!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            className="rounded-xl p-4 text-center"
            style={{
              backgroundColor: "#F59F00",
            }}
          >
            <MapPin
              className="w-6 h-6 mx-auto mb-2"
              style={{ color: "#FFF6ED" }}
            />
            <div
              className="text-2xl font-bold"
              style={{ color: "#FFF6ED" }}
            >
              {crawl.stops.length}
            </div>
            <div
              className="text-sm"
              style={{ color: "#FFF6ED"}}
            >
              Stops
            </div>
          </div>
          <div
            className="rounded-xl p-4 text-center"
            style={{
              background:
                "linear-gradient(to bottom right, #82ab3b)",
            }}
          >
            <DollarSign
              className="w-6 h-6 mx-auto mb-2"
              style={{ color: "#FFF6ED" }}
            />
            {crawl.budgetTier ? (
              <>
                <div
                  className="text-lg font-bold"
                  style={{ color: "#FFF6ED" }}
                >
                  Food Funds: {(() => {
                    const restaurantCount = crawl.stops.filter(
                      (s) => s.type === "restaurant"
                    ).length;
                    if (restaurantCount === 0)
                      return "Free";
                    return getTotalRangeUpper(
                      crawl.budgetTier,
                      restaurantCount
                    );
                  })()}
                </div>
                <div
                  className="text-sm mt-1"
                  style={{ color: "#FFF6ED" }}
                >
                  {PRICE_TIER_RANGE_DISPLAY[crawl.budgetTier].label} per meal
                </div>
              </>
            ) : (
              <>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#242116" }}
                >
                  ${crawl.totalCost}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "#242116", opacity: 0.6 }}
                >
                  Total Cost
                </div>
              </>
            )}
          </div>
          <div
            className="rounded-xl p-4 text-center"
            style={{
              backgroundColor: "#F59F00",
            }}
          >
            <Clock
              className="w-6 h-6 mx-auto mb-2"
              style={{ color: "#FFF6ED" }}
            />
            <div
              className="text-2xl font-bold"
              style={{ color: "#FFF6ED" }}
            >
              {Math.floor(crawl.totalTime / 60)}h{" "}
              {crawl.totalTime % 60}m
            </div>
            <div
              className="text-sm"
              style={{ color: "#FFF6ED" }}
            >
              Duration
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div
        className="bg-white rounded-2xl p-6 mb-6 border border-gray-100"
        style={{
          boxShadow: "0 10px 30px rgba(245, 159, 0, 0.15)",
        }}
      >
        <div className="mb-3 md:mb-4">
          <h3
            className="text-xl md:text-2xl font-bold mb-1 md:mb-2"
            style={{ color: "#242116" }}
          >
            Your Route
          </h3>
          <p className="text-xs md:text-base" style={{ color: "#242116", opacity: 0.6 }}>
            Follow the numbered pins to navigate your food crawl
          </p>
        </div>
        {mapsLoaded ? (
          <ResultMap stops={crawl.stops} onOrderOptimized={onOrderOptimized} />
        ) : mapError ? (
          <div className="w-full h-60 md:h-[500px] bg-red-50 rounded-2xl flex items-center justify-center border-2 border-red-200\">
            <div className="text-center px-8">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="text-red-700 font-semibold mb-2">
                Map Load Error
              </p>
              <p className="text-sm text-red-600 mb-4">
                {mapError}
              </p>
              <div className="bg-white rounded-lg p-4 text-left text-sm">
                <p
                  className="font-medium mb-2"
                  style={{ color: "#242116" }}
                >
                  To fix this:
                </p>
                <ol
                  className="list-decimal list-inside space-y-1"
                  style={{ color: "#242116", opacity: 0.6 }}
                >
                  <li>
                    Get a Google Maps API key from Google Cloud
                    Console
                  </li>
                  <li>Enable Maps JavaScript API</li>
                  <li>
                    Replace{" "}
                    <code className="bg-gray-100 px-2 py-0.5 rounded">
                      YOUR_GOOGLE_MAPS_API_KEY_HERE
                    </code>{" "}
                    in CrawlItinerary.tsx
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-60 md:h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center\">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 mb-4"
                style={{ borderTopColor: "#F59F00" }}
              ></div>
              <p style={{ color: "#242116", opacity: 0.6 }}>
                Loading map...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stop Details List */}
      <div className="space-y-4 md:space-y-6">
        {crawl.stops.map((stop, index) => {
          const isExpanded = expandedStops.has(stop.id);
          return (
          <div
            key={stop.id}
            className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden"
            style={{
              boxShadow: "0 6px 20px rgba(245, 159, 0, 0.06)",
            }}
          >
            {/* Collapsed Header - Always visible */}
            <div
              onClick={() => toggleExpanded(stop.id)}
              className="cursor-pointer p-4 md:p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              {/* Image */}
              <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                <ImageWithFallback
                  src={stop.image}
                  alt={stop.name}
                  className="w-full h-full object-cover rounded-lg"
                  style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>

              {/* Name and Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
                    style={{
                      backgroundColor:
                        stop.type === "restaurant"
                          ? "#F59F00"
                          : "#9B59B6",
                    }}
                  >
                    {index + 1}
                  </div>
                  <h3
                    className="text-base md:text-lg font-bold truncate"
                    style={{ color: "#242116" }}
                  >
                    {stop.name}
                  </h3>
                </div>
                {stop.cuisine && (
                  <div
                    className="text-xs md:text-sm flex items-center gap-1"
                    style={{ color: "#F59F00" }}
                  >
                    <Utensils className="w-3 h-3" />
                    {stop.cuisine}
                  </div>
                )}
              </div>

              {/* Expand Icon */}
              <ChevronDown
                className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform"
                style={{
                  color: "#242116",
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Full Image */}
                  <div className="flex-shrink-0 w-full md:w-48">
                    <ImageWithFallback
                      src={stop.image}
                      alt={stop.name}
                      className="w-full md:w-48 h-40 md:h-48 object-cover rounded-xl"
                      style={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4 mb-3 md:mb-4">
                      <div className="flex items-start gap-3 md:gap-4 min-w-0">
                        {/* Title and Type */}
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-lg md:text-2xl font-bold mb-1 break-words"
                            style={{ color: "#242116" }}
                          >
                            {stop.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                            {stop.cuisine && (
                              <div
                                className="flex items-center gap-1.5 flex-shrink-0"
                                style={{ color: "#F59F00" }}
                              >
                                <Utensils className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="text-xs md:text-sm font-medium">
                                  {stop.cuisine}
                                </span>
                              </div>
                            )}
                            {stop.type === "landmark" && (
                              <span
                                className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium flex-shrink-0"
                                style={{
                                  backgroundColor: "#EDE7F6",
                                  color: "#7B1FA2",
                                }}
                              >
                                Landmark
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price Badge */}
                      {stop.type === "restaurant" && (
                        <div
                          className="px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-sm flex-shrink-0"
                          style={{
                            backgroundColor: "#E8F5E9",
                            color: "#2E7D32",
                          }}
                        >
                          {stop.priceTier ?? `$${stop.price}`}
                        </div>
                      )}
                    </div>

                    <p
                      className="mb-3 md:mb-4 leading-relaxed text-sm md:text-base"
                      style={{ color: "#242116", opacity: 0.7 }}
                    >
                      {stop.description}
                    </p>

                    <div className="flex flex-col gap-2 text-xs md:text-sm">
                      <div className="flex items-start gap-2 text-gray-500 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{stop.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span>{stop.duration} min at stop</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-500 flex-wrap">
                        {index === 0 ? (
                          <span>ETA: 0 min (starting here)</span>
                        ) : (
                          <span>
                            ETA: ~{crawl.stops[index - 1].walkingMinutesToNext ?? "?"} min walk from previous
                          </span>
                        )}
                      </div>
                      {index < crawl.stops.length - 1 && stop.walkingMinutesToNext != null && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>~{stop.walkingMinutesToNext} min walk to next</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        })}
      </div>

      {/* Save Crawl and New Crawl Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '24px',
          marginBottom: '24px',
          alignItems: 'stretch',
        }}
        className="md:flex-row md:justify-center md:items-center"
      >
        {onSaveCrawl && (
          <button
            onClick={onSaveCrawl}
            disabled={isSaving || justSaved}
            style={{
              padding: '12px 24px md:px-12 md:py-4',
              backgroundColor: justSaved ? '#82ab3b' : '#F59F00',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: isSaving || justSaved ? 'not-allowed' : 'pointer',
              fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: justSaved ? '0 4px 12px rgba(130, 171, 59, 0.3)' : '0 4px 12px rgba(245, 159, 0, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              if (!isSaving && !justSaved) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 159, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = justSaved ? '0 4px 12px rgba(130, 171, 59, 0.3)' : '0 4px 12px rgba(245, 159, 0, 0.3)';
            }}
          >
            {justSaved ? (
              <>
                <Check size={20} />
                Saved!
              </>
            ) : isSaving ? (
              'Saving...'
            ) : (
              'Save Crawl'
            )}
          </button>
        )}
        <button
          onClick={onReset}
          style={{
            padding: '12px 24px',
            backgroundColor: 'white',
            color: '#242116',
            border: '2px solid #F59F00',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '44px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 159, 0, 0.3)';
            e.currentTarget.style.backgroundColor = '#FFF8E7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          New Crawl
        </button>
      </div>
    </div>
  );
}